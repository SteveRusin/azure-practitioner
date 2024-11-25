FROM ollama/ollama:0.4.2

COPY ./run-ollama.sh /tmp/run-ollama.sh

WORKDIR /tmp

RUN chmod +x run-ollama.sh \
    && ./run-ollama.sh

EXPOSE 11434

