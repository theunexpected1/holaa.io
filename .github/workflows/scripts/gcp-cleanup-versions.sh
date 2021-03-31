# 1. Set the Google Cloud project
if [ ! -z $1 ]; then 
  PROJECT_NAME=$1
else
  PROJECT_NAME=remo-conference
fi

echo "[gcp-cleanup-versions] Delete stale versions for '$PROJECT_NAME'. Fetching stale versions..."
gcloud config set project $PROJECT_NAME

# Eg: Retain 2 versions of 'api', and 5 versions of 'default'
gcpServices=("api" "default")

# 2. Set number of versions to retain per project
case "$PROJECT_NAME" in
  "remo-conference")
    retainVersionsCount=(2 5)
    ;;
  *)
    retainVersionsCount=(2 2)
    ;;
esac

# 3. Get stale versions
versionsToDelete=""
for i in ${!gcpServices[@]}; do
  versions=$(gcloud app versions list \
  --service ${gcpServices[i]} \
  --sort-by '~version' \
  --format 'value(VERSION.ID)'| sed 1,${retainVersionsCount[i]}d)
  # --filter="traffic_split=0" \

  [ ! -z "$versions" ] && versionsToDelete="$versionsToDelete $versions"
done


# 4. Delete Versions (if any)
if [ ! -z $versionsToDelete ]; then 
  echo "[gcp-cleacnup-versions] Deleting stale versions: $versionsToDelete..."
  gcloud app versions delete $versionsToDelete --quiet
  echo "[gcp-cleanup-versions] Successfully deleted stale versions."
else
  echo "[gcp-cleanup-versions] No stale versions found across services as per criteria."
fi

# gcloud app versions list --service default --sort-by '~create_time' --format 'value(VERSION.ID)'| sed 1,"$retainDefaultVersionsCount"d
# gcloud app versions list --service default --sort-by '~create_time' --format 'value(VERSION.ID)'| sed 1,5d
# code=$(git --no-pager diff --name-only FETCH_HEAD $(git merge-base FETCH_HEAD master) | grep "server/src" && exit 1 || exit 0)
#echo $?