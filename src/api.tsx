import { useCallback } from "react";

// Define the response type
interface ProblemResponse {
    problem: string;
    level: string;
    type: string;
    solution: string;
    id: string;
}
