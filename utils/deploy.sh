# Create a postgres instance in a docker container

POSTGRES_PASSWORD="postgresPassword1!"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
if  docker ps -a | grep garden-postgres
then
    if [ "$db_rebuild" = "y" ]; then
    	echo "Rebuilding Postgresql"
    	docker rm -f garden-postgres
    	docker run --rm -d --name garden-postgres -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -p 9990:5432 postgres
        echo "Sleeping for 10 seconds to allow postgres to complete start up..."
        sleep 10
    fi
else
    echo "Starting Postgresql"
    docker run --rm -d --name garden-postgres -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -p 9990:5432 postgres
    echo "Sleeping for 10 seconds to allow postgres to complete start up..."
    sleep 10
fi
export DB_CONNECTION="postgres://postgres:$POSTGRES_PASSWORD@localhost:9990/postgres?sslmode=disable"
echo $DB_CONNECTION

# insert the db migration...
cd ../migrations
docker build -t garden-migrations .
docker run -it --rm -e DB_CONNECTION=$DB_CONNECTION --network host garden-migrations


# insert the db migration...
mkdir -p ~/.gardens
CONFIG=~/.gardens
PATH=${CONFIG}/bin:$PATH

if [[ ! -f ${CONFIG}/jwtInternalRS256.key ]];
then
  cd $CONFIG
  ssh-keygen -m PEM -t rsa -b 4096 -f ./jwtInternalRS256.key  -N ''
  openssl rsa -in ./jwtInternalRS256.key -pubout -outform PEM -out ./jwtInternalRS256.key.pub
  echo "Internal keys created"
fi
export JWT_INTERNAL_PUBLIC_KEY=$(cat ${CONFIG}/jwtInternalRS256.key.pub)
export JWT_INTERNAL_PRIVATE_KEY=$(cat ${CONFIG}/jwtInternalRS256.key)

if [[ ! -f ${CONFIG}/jwtExternalRS256.key ]];
then
  cd $CONFIG
  ssh-keygen -m PEM -t rsa -b 4096 -f ./jwtExternalRS256.key  -N ''
  openssl rsa -in ./jwtExternalRS256.key -pubout -outform PEM -out ./jwtExternalRS256.key.pub
  echo "External keys created"
fi
export JWT_EXTERNAL_PUBLIC_KEY=$(cat ${CONFIG}/jwtExternalRS256.key.pub)
export JWT_EXTERNAL_PRIVATE_KEY=$(cat ${CONFIG}/jwtExternalRS256.key)

# insert the db migration...
cd ../migrations
docker build -t garden-migrations .
docker run -it --rm -e DB_CONNECTION=$DB_CONNECTION --network host garden-migrations

# Run ambassador
docker rm -f garden-ambassador
docker_host=$(ip a | grep docker0 | grep -Eo "inet .*/16" | sed "s/inet //" | sed "s/\/16//")
docker run --rm -d --name garden-ambassador -p 8080:8080 -v"$DIR/ambassador-config":/ambassador/ambassador-config --add-host dockerhost:$docker_host quay.io/datawire/ambassador:0.86.1

cd $DIR
echo "Starting Node apps"
pm2 kill
ROOT_DIR=$DIR/../ pm2 start pm2.config.js

