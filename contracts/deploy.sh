#! /bin/bash

COINS="XPA XLD XNY XRO XTK XAT XMO XSD XRI"

addrs=()
for coin in $COINS; do
  completium-cli deploy coin_fa12.arl --named $coin --force > /dev/null
  addr=`completium-cli show contract $coin | sed 's/ *$//g'`
  addrs+=(@$addr)
  echo $coin "deployed: " $addr
done
printf -v params '%s,' "${addrs[@]}"

completium-cli deploy dex.arl --init "(${params%,})" --named dex --force > /dev/null
echo "dex deployed, done"
