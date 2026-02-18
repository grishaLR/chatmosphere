#!/bin/sh
exec turnserver -n \
  --listening-port=3478 \
  --realm=protoimsg.app \
  --use-auth-secret \
  --static-auth-secret="$COTURN_SHARED_SECRET" \
  --no-cli \
  --fingerprint \
  --no-multicast-peers \
  --secure-stun \
  --denied-peer-ip=10.0.0.0-10.255.255.255 \
  --denied-peer-ip=172.16.0.0-172.31.255.255 \
  --denied-peer-ip=192.168.0.0-192.168.255.255 \
  --min-port=49152 \
  --max-port=49252 \
  --total-quota=52428800 \
  --user-quota=5242880
