# stack-overflow


## How to start
```
docker volume create db-backup
cd ui
npm -i --force
npm run build
cd ..
docker-compose up -d
```
## Create admin user
```
docker exec <core container id> node admin.js <username>
```
