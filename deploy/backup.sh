#!/bin/sh
# Nightly backup: Postgres dump + seller uploads. Run on the VPS via cron:
#   0 3 * * * /root/instaads/deploy/backup.sh >> /var/log/instaads-backup.log 2>&1
set -e
DIR=/root/backups
KEEP_DAYS=14
STAMP=$(date +%Y%m%d-%H%M)
mkdir -p "$DIR"
docker exec deploy-postgres-1 pg_dump -U adpage adpage | gzip > "$DIR/db-$STAMP.sql.gz"
docker run --rm -v deploy_app_data:/data -v "$DIR":/backup alpine \
  tar czf "/backup/uploads-$STAMP.tar.gz" -C /data uploads published
find "$DIR" -name '*.gz' -mtime +$KEEP_DAYS -delete
echo "backup ok $STAMP ($(du -sh $DIR | cut -f1) total)"
