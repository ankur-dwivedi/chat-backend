# to take backup
docker exec -ti mymongodb sh

mongodump --out /backup/

sudo docker cp mymongodb:/backup/ backup/

# to restore

docker cp backup/ mymongodb:/backup_restore

mongorestore -d cascade /backup_restore/cascade/

docker exec -it mybackend bash

k1ll 1


// for k8

docker build -t ankurdwivedi/padboat-backend .

docker push ankurdwivedi/padboat-backend

kubectl apply -f=./kubernetes/backend-deployment.yaml -f=./kubernetes/backend-service.yaml

kubectl apply -f=./kubernetes/mongodb-deployment.yaml -f=./kubernetes/mongodb-service.yaml

// to connect to mongodb on compass

kubectl port-forward mongodb-deployment-7b479895bb-798rx 27017:27017 

mongodb://admin:1HKgUksK7q8QDJdM@localhost:27017