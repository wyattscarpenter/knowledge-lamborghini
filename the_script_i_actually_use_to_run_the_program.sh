# This is the script I actually use for running this program, as the system I run it on has pretty good system logs so I don't need to handle logging specially.

if [ ! -d knowledge-lamborghini ]
then
    git clone https://github.com/wyattscarpenter/knowledge-lamborghini
fi
cd knowledge-lamborghini
./constantly-try-to-update &

npm install --silent
npm start
