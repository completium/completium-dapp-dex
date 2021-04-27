#! /bin/bash

COINS="XPA XLD XNY XRO XTK XAT XMO XSD XRI"

addrs=()
for coin in $COINS; do
  completium-cli deploy coin_fa12.arl --init '@tz1Lc2qBKEWCBeDU8npG6zCeCqpmaegRi6Jg' --named $coin --force > /dev/null
  addr=`completium-cli show address $coin`
  addrs+=(@$addr)
  echo $coin "deployed: " $addr
done
printf -v params '%s,' "${addrs[@]}"

completium-cli deploy dex.arl --init "(${params%,})" --named dex --force > /dev/null
echo "dex deployed, done"
