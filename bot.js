const { Client } = require('whatsapp-web.js');
const express = require('express');
const client = new Client();
const app = express();

// Contador para flood
const messageCount = {};

client.on('ready', () => {
    console.log('Bot está pronto!');
});

client.on('qr', (qr) => {
    console.log('Escaneie este QR Code com o WhatsApp Business:', qr);
});

client.on('message', async (msg) => {
    const chat = await msg.getChat();

    if (chat.isGroup) {
        const content = msg.body.toLowerCase();

        // Lista de palavrões
        const palavroes = [
            "arrombado", "babaca", "bicha", "bichona", "boceta", 
            "bocetinha", "boiola", "bostinha", 
            "buceta", "bucetinha", "bundão", "cabaço", 
            "cacete", "cacetinho", "cagão", 
            "canalha", "caralho", "chifrudo", 
            "cocô", "corno", "cornudo", "cretino", 
            "cu", "cú", "culhão", "cusão", "desgraça", "desgraçado", "enrabado", 
            "escroto", "fdp", "fedido", 
            "fedelho", "fiasquento", "fiofó", "fodase", "fodidão", "fodido", "fuder", 
            "fudido", "gozado", "gozar", 
            "idiota", "imbecil", "jumento", "lambão", "leproso", "maconheiro", "maldito", 
            "mangação", "merdinha", "mijado", "mijo", "mongoloide", "otário", "paspalho", "pau", 
            "pauzudo", "peba", "peidão", "peido", "pilantra", 
            "pinto", "pintinho", "piranha", "piroca", "pirocudo", 
            "porra", "porrada", "punheta", "punheteiro", "puta", 
            "putaria", "putona", "quenga", "rola", 
            "roludo", "sacana", "safado", 
            "siririca", "tarado", "tesão", "tetinha", "teta", 
            "traste", "vadia", "vagabunda", 
            "vagabundo", "veado", "viado", "viadinho", "xereca", 
            "xibiu", "xota", "xoxota", "xoxotinha", "filho da puta"
        ];

        // 1. Apagar mensagens com links
        if (content.includes('http') || content.includes('www')) {
            msg.delete(true);
            console.log(`Mensagem com link apagada: ${content}`);
            chat.sendMessage('Não é permitido o envio de links nesse chat!');
            return;
        }

        // 2. Apagar mensagens com palavrões
        const palavroesRegex = new RegExp(`\\b(${palavroes.join('|')})\\b`, 'i');
        if (palavroesRegex.test(content)) {
            msg.delete(true);
            console.log(`Mensagem com palavrão apagada: ${content}`);
            return;
        }

        // 3. Detectar flood (5 mensagens em menos de 3 segundos)
        const now = Date.now();
        if (msg.from in messageCount) {
            const userData = messageCount[msg.from];
            userData.messages.push(now);

            userData.messages = userData.messages.filter(
                timestamp => now - timestamp <= 3000
            );

            if (userData.messages.length >= 5) {
                msg.delete(true);
                console.log(`Por favor, não envie tantas mensagens de uma vez só!: ${content}`);
                chat.sendMessage(`@${msg.from.split('@')[0]} Calma aí, sem flood!`);
                return;
            }
        } else {
            messageCount[msg.from] = { messages: [now] };
        }
    }
});

client.initialize();

// ✅ Servidor HTTP para manter o Koyeb online
app.get('/', (req, res) => {
    res.send('Bot do WhatsApp está rodando com sucesso!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor HTTP rodando na porta ${PORT}`);
});
