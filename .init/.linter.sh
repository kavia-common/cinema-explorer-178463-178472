#!/bin/bash
cd /home/kavia/workspace/code-generation/cinema-explorer-178463-178472/movie_backend
source venv/bin/activate
flake8 .
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

