if [ ! -d knowledge-lamborghini ]
then
    git clone https://github.com/wyattscarpenter/knowledge-lamborghini
fi
cd knowledge-lamborghini
git pull

npm install
npm start >logs.txt
