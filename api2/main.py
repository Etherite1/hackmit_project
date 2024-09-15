# Imports
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
import pandas as pd
import pickle

# Initialize Flask server
app = Flask(__name__)
CORS(app) 

# Load JSONL file into Pandas dataframe
def load_from_jsonl(file_path, show_progress = False):
    lines = []
    with open(file_path, encoding="utf8") as f:
        lines = f.read().splitlines()
    line_dicts = []
    if show_progress:
        for line in lines:
            line_dicts.append(json.loads(line))
    else:
        line_dicts = [json.loads(line) for line in lines]
    df = pd.DataFrame(line_dicts)
    return df

# Code below is from Tevatron's encode.py script
# Import libraries for Tevatron: https://github.com/texttron/tevatron/tree/main
import logging
import os
import pickle
import sys
from contextlib import nullcontext

import numpy as np
from tqdm import tqdm

import torch

from torch.utils.data import DataLoader
from transformers import AutoConfig, AutoTokenizer
from transformers import (
    HfArgumentParser,
)

from tevatron.arguments import ModelArguments, DataArguments, \
    DenseTrainingArguments as TrainingArguments
from tevatron.data import EncodeDataset, EncodeCollator
from tevatron.modeling import DenseOutput, DenseModelForInference
from tevatron.datasets import HFQueryDataset, HFCorpusDataset


# Load DPR model with tevatron
parser = HfArgumentParser((ModelArguments, DataArguments, TrainingArguments))
model_args, data_args, training_args = parser.parse_json_file(json_file=os.path.abspath("args.json"))
num_labels = 1
config = AutoConfig.from_pretrained(
    model_args.config_name if model_args.config_name else model_args.model_name_or_path,
    num_labels=num_labels,
    cache_dir=model_args.cache_dir,
)
tokenizer = AutoTokenizer.from_pretrained(
    model_args.tokenizer_name if model_args.tokenizer_name else model_args.model_name_or_path,
    cache_dir=model_args.cache_dir,
    use_fast=False,
)

model = DenseModelForInference.build(
    model_name_or_path=model_args.model_name_or_path,
    config=config,
    cache_dir=model_args.cache_dir,
)
print(model)

# Load MATH dataset
MATH_dataset = {}
with open("MATH_dataset.json") as f:
    MATH_dataset = json.load(f)

@app.route("/get_problem", methods=["POST"])
def get_problem():
    problem_id = request.get_json().problem_id
    res = {}
    if problem_id in MATH_dataset:
        res = MATH_dataset[problem_id]
    return jsonify(res)

@app.route("/", methods=["POST"])
def query_embedding():
    global model
    q_emb = np.zeros(768, dtype=np.float64).tolist()
    try:
        query = request.get_json().query

        # Embed given query with Tevatron
        with open("query.jsonl", "w") as f:
            f.write(json.dumps({
                "query_id": "query_id",
                "query": query,
                "positive_passages": [],
                "negative_passages": []
            }))
            f.write("\n")
        query_df = load_from_jsonl("query.jsonl")
        query_df.to_parquet("query.parquet")

        text_max_length = data_args.q_max_len if data_args.encode_is_qry else data_args.p_max_len
        if data_args.encode_is_qry:
            encode_dataset = HFQueryDataset(tokenizer=tokenizer, data_args=data_args,
                                            cache_dir=data_args.data_cache_dir or model_args.cache_dir)
        else:
            encode_dataset = HFCorpusDataset(tokenizer=tokenizer, data_args=data_args,
                                            cache_dir=data_args.data_cache_dir or model_args.cache_dir)
        encode_dataset = EncodeDataset(encode_dataset.process(data_args.encode_num_shard, data_args.encode_shard_index),
                                    tokenizer, max_len=text_max_length)

        encode_loader = DataLoader(
            encode_dataset,
            batch_size=training_args.per_device_eval_batch_size,
            collate_fn=EncodeCollator(
                tokenizer,
                max_length=text_max_length,
                padding='max_length'
            ),
            shuffle=False,
            drop_last=False,
            num_workers=training_args.dataloader_num_workers,
        )
        encoded = []
        lookup_indices = []
        model = model.to(training_args.device)
        model.eval()

        for (batch_ids, batch) in tqdm(encode_loader):
            lookup_indices.extend(batch_ids)
            with torch.cuda.amp.autocast() if training_args.fp16 else nullcontext():
                with torch.no_grad():
                    for k, v in batch.items():
                        batch[k] = v.to(training_args.device)
                    if data_args.encode_is_qry:
                        model_output: DenseOutput = model(query=batch)
                        encoded.append(model_output.q_reps.cpu().detach().numpy())
                    else:
                        model_output: DenseOutput = model(passage=batch)
                        encoded.append(model_output.p_reps.cpu().detach().numpy())

        encoded = np.concatenate(encoded)

        with open(data_args.encoded_save_path, 'wb') as f:
            pickle.dump((encoded, lookup_indices), f)

        with open("query.pkl", "rb") as f:
            q_emb = pickle.load(f)
            q_emb = list(np.float64(q_emb[0][0]))
    except Exception as e:
        print(traceback.format_exc())
        print(e)
    return jsonify(q_emb)

if __name__ == "__main__":
    app.run(debug=True)