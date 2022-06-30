const { readFileSync, writeFileSync, readdirSync, rmSync, existsSync, mkdirSync } = require('fs');
const sharp = require('sharp');

const template = `
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- bg -->
        <!-- tower -->
        <!-- face -->
        <!-- key -->
    </svg>
`

const takenNames = {};
const takenComputers = {};
let idx = 99;

function randInt(max) {
    return Math.floor(Math.random() * (max + 1));
}

function randElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomName() {
    const adjectives = 'happy sad angry evil depressed sinister joyful crazy insane clever friendly funny grumpy kind lazy moody nervous serious'.split(' ');
    const names = 'bolt cole robbie mechan auto unxtron owinator silver earl rob plier mulator copper greez scrappie'.split(' ');
    
    const randAdj = randElement(adjectives);
    const randName = randElement(names);
    const name =  `${randAdj}-${randName}`;

    if (takenNames[name] || !name) {
        return getRandomName();
    } else {
        takenNames[name] = name;
        return name;
    }
}

function getLayer(name, skip=0.0) {
    const svg = readFileSync(`./layers/${name}.svg`, 'utf-8');
    const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
    const layer = svg.match(re)[0];
    return Math.random() > skip ? layer : '';
}

async function svgToPng(name) {
    const src = `./out/${name}.svg`;
    const dest = `./out/${name}.png`;

    const img = await sharp(src);
    const resized = await img.resize(1024);
    await resized.toFile(dest);
}

function createImage(idx) {
    // 17,550 possible combinations
    
    const bg = randInt(7);
    const tower = randInt(1);
    const face = randInt(14);
    const key = randInt(1);

    const computer = [tower, face, key].join('');

    if (computer[takenComputers]) {
        createImage();
    } else {
        const name = getRandomName()
        console.log(name)
        computer[takenComputers] = computer;

        const final = template
            .replace('<!-- bg -->', getLayer(`bg${bg}`))
            .replace('<!-- tower -->', getLayer(`tower${tower}`))
            .replace('<!-- face -->', getLayer(`face${face}`))
            .replace('<!-- key -->', getLayer(`key${key}`))

        const meta = {
            name,
            description: `A drawing of ${name.split('-').join(' ')}`,
            image: `${idx}.png`,
            attributes: [
                { 
                    rarity: 0.5
                }
            ]
        }
        writeFileSync(`./out/${idx}.json`, JSON.stringify(meta))
        writeFileSync(`./out/${idx}.svg`, final)
        svgToPng(idx)
    }
}

// Create dir if not exists
if (!existsSync('./out')){
    mkdirSync('./out');
}

// Cleanup dir before each run
readdirSync('./out').forEach(f => rmSync(`./out/${f}`));

do {
    createImage(idx);
    idx--;
} while (idx >= 0);