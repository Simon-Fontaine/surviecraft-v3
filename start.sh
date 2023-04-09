#!/bin/bash
cd surviecraft-v3

if ! screen -list | grep -q "bot"; then
	echo "Bot was not started, starting in background!"

	git pull;
	npm update;

  screen -LdmS bot node index.js
else
	echo "Bot is already started, not starting!"
fi