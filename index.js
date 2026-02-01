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
    precio: 120,
    max_boletos: 500,

}];
let boletos = [{
    id: 0,
    conciertoId: 0,
    comprador: "Juan Perez",
    cantidad: 2
}];
let conciertoIdCounter = 1;
let boletoIdCounter = 1;

// -----------------------------
// CONCIERTOS
// -----------------------------

app.get('/conciertos', (req, res) => res.json(conciertos));

app.get('/conciertos/:id', (req, res) => {
    let concierto = conciertos.find(c => c.id == req.params.id);
    if (concierto) {
        res.json(concierto);
    } else {
        res.status(404).json({ message: "Concierto no encontrado" });
    }
});

app.get('/conciertos/:id/boletos_vendidos', (req, res) => {
    let concierto = conciertos.find(c => c.id == req.params.id);
    if (concierto) {
        let total_boletos_vendidos = totalBoletosVendidos(concierto.id);
        res.json({ boletos_vendidos: total_boletos_vendidos });
    } else {
        res.status(404).json({ message: "Concierto no encontrado" });
    }
});

app.post('/conciertos', (req, res) => {
    let concierto = req.body;

    if (concierto.artista && concierto.fecha && concierto.hora && concierto.sede && concierto.ciudad && concierto.precio > 0 && concierto.max_boletos > 0) {
        concierto.id = conciertoIdCounter++;
        conciertos.push(concierto);
        res.status(201).send();
    } else {
        res.status(400).json({
            message: "Parametros invalidos"
        }).send();
    }
});

app.put('/conciertos/:id', (req, res) => {
    let concierto = conciertos.find(c => c.id == req.params.id);

    if (concierto) {
        // permitir editar cada uno de los campos
        let updatedData = req.body;

        if (updatedData.artista) concierto.artista = updatedData.artista;
        if (updatedData.fecha) concierto.fecha = updatedData.fecha;
        if (updatedData.hora) concierto.hora = updatedData.hora;
        if (updatedData.sede) concierto.sede = updatedData.sede;
        if (updatedData.ciudad) concierto.ciudad = updatedData.ciudad;
        if (updatedData.precio && updatedData.precio > 0) concierto.precio = updatedData.precio;
        if (updatedData.max_boletos && updatedData.max_boletos > 0) concierto.max_boletos = updatedData.max_boletos;

        res.status(200).send();
    } else {
        res.status(404).json({ message: "Concierto no encontrado" });
    }
});

app.delete('/conciertos/:id', (req, res) => {
    let index = conciertos.findIndex(c => c.id == req.params.id);
    if (index !== -1) {
        conciertos.splice(index, 1); // Eliminar el concierto del array
        res.status(204).send();
    } else {
        res.status(404).json({ message: "Concierto no encontrado" });
    }
});

// -----------------------------
// BOLETOS
// -----------------------------

app.get('/boletos', (req, res) => res.json(boletos));

app.post('/boletos', (req, res) => {
    let boleto = req.body;
    let concierto = conciertos.find(c => c.id == boleto.conciertoId);
    if (concierto) {
        let total_boletos_vendidos = totalBoletosVendidos(boleto.conciertoId);

        if (boleto.comprador && boleto.cantidad > 0) {
            if((total_boletos_vendidos + boleto.cantidad) <= concierto.max_boletos) {
                boleto.id = boletoIdCounter++;
                boletos.push(boleto);
                res.status(201).send();
            } else {
                res.status(400).json({
                    message: "Concierto no tiene boletos suficientes"
                }).send();
            }
        } else {
            res.status(400).json({
                message: "Parametros invalidos o boletos insuficientes"
            }).send();
        }
    } else {
        res.status(404).json({ message: "Concierto no encontrado" });
    }
});

app.put('/boletos/:id', (req, res) => {
    let boleto = boletos.find(b => b.id == req.params.id);
    let concierto = conciertos.find(c => c.id == boleto.conciertoId);

    if (boleto && concierto) {
        let updatedData = req.body;
        if (updatedData.cantidad && updatedData.cantidad > 0) {
            // hay que verificar si hay suficientes boletos en el concierto
            let total_boletos_vendidos = totalBoletosVendidos(boleto.conciertoId, boleto.id);

            if((total_boletos_vendidos + updatedData.cantidad) <= concierto.max_boletos) {
                boleto.cantidad = updatedData.cantidad;
            } else {
                return res.status(400).json({
                    message: "Concierto no tiene boletos suficientes"
                }).send();
            }
        }
        if (updatedData.comprador) boleto.comprador = updatedData.comprador;
        res.status(200).send();
    } else {
        res.status(404).json({ message: "Boleto o concierto no encontrado" });
    }
});

app.delete('/boletos/:id', (req, res) => {
    let index = boletos.findIndex(b => b.id == req.params.id);
    if (index !== -1) {
        boletos.splice(index, 1); // Eliminar el boleto del array
        res.status(204).send();
    } else {
        res.status(404).json({ message: "Boleto no encontrado" });
    }
});


// -----------------------------
// INICIAR SERVIDOR
// -----------------------------

app.listen(PORT, () => {
    console.log(`fest.io backend running on port ${PORT}`);
}); 

// -----------------------------
// Función para contar boletos vendidos de un concierto
// -----------------------------
function totalBoletosVendidos(conciertoId, excluirBoletoId = null) {
    const boletosFiltrados = boletos.filter(b => b.conciertoId == conciertoId && b.id !== excluirBoletoId);
    let total = 0;
    for (let i = 0; i < boletosFiltrados.length; i++) {
        total += boletosFiltrados[i].cantidad;
    }
    return total;
}