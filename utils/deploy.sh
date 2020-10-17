# Run postgres

POSTGRES_PASSWORD="postgresPassword1!"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

if  docker ps -a | grep garden-postgres
then
    if [ "$db_rebuild" = "y" ]; then
    	echo "Rebuilding Postgresql"
    	docker rm -f garden-postgres
    	docker run --rm -d --name garden-postgres -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -p 9990:5432 postgres
    fi
else
    echo "Starting Postgresql"
    docker run --rm -d --name garden-postgres -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -p 9990:5432 postgres
fi


export DB_CONNECTION="postgres://postgres:$POSTGRES_PASSWORD@localhost:9990/postgres?sslmode=disable"

echo $DB_CONNECTION

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

