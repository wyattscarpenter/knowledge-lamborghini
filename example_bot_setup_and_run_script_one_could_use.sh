if [ ! -d knowledge-lamborghini ]
then
    git clone https://github.com/wyattscarpenter/knowledge-lamborghini
fi
cd knowledge-lamborghini
git pull

echo "New log chunk" >>logs.txt
date >>logs.txt
npm install >>logs.txt
npm start >>logs.txt
