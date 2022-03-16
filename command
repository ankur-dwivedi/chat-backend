# to take backup
docker exec -ti mymongodb sh

mongodump --out /backup/

sudo docker cp mymongodb:/backup/ backup/

# to restore

docker cp backup/ mymongodb:/backup_restore

mongorestore -d cascade /backup_restore/cascade/