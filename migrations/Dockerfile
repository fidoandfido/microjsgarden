FROM golang

RUN go get bitbucket.org/liamstask/goose/cmd/goose

RUN export PATH="$GOPATH:$PATH"

COPY db db

CMD ["goose", "up"]
