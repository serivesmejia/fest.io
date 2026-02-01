const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// -----------------------------
// BASE DE DATOS BASICA
// -----------------------------
let conciertos = [{
    id: 0,
    artista: "Ed Maverick",
    fecha: "2026-02-27",
    hora: "20:00",
    sede: "Teatro de los Heroes",
    ciudad: "Chihuahua",
    precio: 120

}];
let boletos = [];
let conciertoIdCounter = 1;
let boletoIdCounter = 1;

// -----------------------------
// CONCIERTOS
// -----------------------------

app.get('/conciertos', (req, res) => res.json(conciertos));


app.post('/conciertos', (req, res) => {
    let concierto = req.body;

    if (concierto.artista && concierto.fecha && concierto.hora && concierto.sede && concierto.ciudad && concierto.precio > 0) {
        concierto.id = conciertoIdCounter++;
        conciertos.push(concierto);
        res.status(201).send();
    } else {
        res.status(400).json({
            message: "Parametros invalidos"
        }).send();
    }
});

// -----------------------------
// BOLETOS
// -----------------------------


// -----------------------------
// INICIAR SERVIDOR
// -----------------------------

app.listen(PORT, () => {
    console.log(`fest.io backend running on port ${PORT}`);
}); 