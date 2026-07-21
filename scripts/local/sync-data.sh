export $(grep -v '^#' .env.release | xargs)

mv interlex.db interlex-2.db
sshpass -f <(printf '%s\n' $PASSWORD) scp $USERNAME@$HOST:/var/www/interslavic-lexicon.com/interlex/interlex.db interlex.db
rm interlex-2.db
