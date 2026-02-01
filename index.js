const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

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

// -----------------------------
// BASE DE DATOS BASICA
// -----------------------------
let conciertos = [
    {
        id: 0,
        artista: "Ed Maverick",
        fecha: "2026-02-27",
        hora: "20:00",
        sede: "Teatro de los Heroes",
        ciudad: "Chihuahua",
        precio: 120,
        max_boletos: 500
    }
];

let boletos = [
    {
        id: 0,
        conciertoId: 0,
        comprador: "Juan Perez",
        cantidad: 2
    }
];

let conciertoIdCounter = 1;
let boletoIdCounter = 1;

// -----------------------------
// CONCIERTOS
// -----------------------------
app.get('/conciertos', (req, res) => {
    let conciertosConVentas = conciertos.map(concierto => {
        let vendidos = totalBoletosVendidos(concierto.id);
        return { ...concierto, boletos_vendidos: vendidos };
    });
    res.json(conciertosConVentas);
});

app.get('/conciertos/:id', (req, res) => {
    let concierto = conciertos.find(c => c.id == req.params.id); // Clonar objeto
    // Agregar boletos vendidos al concierto
    
    if (concierto) {
        let copia_concierto = { ...concierto };
        copia_concierto.boletos_vendidos = totalBoletosVendidos(concierto.id);
        res.json(copia_concierto);
    } else {
        res.status(404).json({ message: "Concierto no encontrado" });
    }
});

app.post('/conciertos', (req, res) => {
    let concierto = req.body;

    if (concierto.artista && concierto.fecha && concierto.hora && concierto.sede && concierto.ciudad &&
        concierto.precio > 0 && concierto.max_boletos > 0) {
        // solo pushear con los campos necesarios
        let nuevoConcierto = {
            id: conciertoIdCounter++,
            artista: concierto.artista,
            fecha: concierto.fecha,
            hora: concierto.hora,
            sede: concierto.sede,
            ciudad: concierto.ciudad,
            precio: concierto.precio,
            max_boletos: concierto.max_boletos
        };

        conciertos.push(nuevoConcierto);
        res.status(201).json(concierto);
    } else {
        res.status(400).json({ message: "Parámetros inválidos" });
    }
});

app.put('/conciertos/:id', (req, res) => {
    let concierto = conciertos.find(c => c.id == req.params.id);

    if (!concierto) return res.status(404).json({ message: "Concierto no encontrado" });

    let updatedData = req.body;
    if (updatedData.artista) concierto.artista = updatedData.artista;
    if (updatedData.fecha) concierto.fecha = updatedData.fecha;
    if (updatedData.hora) concierto.hora = updatedData.hora;
    if (updatedData.sede) concierto.sede = updatedData.sede;
    if (updatedData.ciudad) concierto.ciudad = updatedData.ciudad;
    if (updatedData.precio && updatedData.precio > 0) concierto.precio = updatedData.precio;
    if (updatedData.max_boletos && updatedData.max_boletos > 0) concierto.max_boletos = updatedData.max_boletos;

    res.status(200).json(concierto);
});

app.delete('/conciertos/:id', (req, res) => {
    let index = conciertos.findIndex(c => c.id == req.params.id);
    if (index !== -1) {
        conciertos.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ message: "Concierto no encontrado" });
    }
});

// -----------------------------
// BOLETOS
// -----------------------------
app.get('/boletos', (req, res) => res.json(boletos));

app.get('/boletos/:concierto_id', (req, res) => {
    let boletosConcierto = boletos.filter(b => b.conciertoId == req.params.concierto_id);
    res.json(boletosConcierto);
});

app.post('/boletos', (req, res) => {
    let boleto = req.body;
    let concierto = conciertos.find(c => c.id == boleto.conciertoId);

    if (!concierto) return res.status(404).json({ message: "Concierto no encontrado" });
    if (!boleto.comprador || boleto.cantidad <= 0) return res.status(400).json({ message: "Parámetros inválidos" });

    let vendidos = totalBoletosVendidos(boleto.conciertoId);
    if (vendidos + boleto.cantidad > concierto.max_boletos)
        return res.status(400).json({ message: "Concierto no tiene boletos suficientes" });
    
    // solo pushear con los campos necesarios
    let nuevoBoleto = {
        id: boletoIdCounter++,
        conciertoId: boleto.conciertoId,
        comprador: boleto.comprador,
        cantidad: boleto.cantidad
    };

    boletos.push(nuevoBoleto);
    res.status(201).json(boleto);
});

app.put('/boletos/:id', (req, res) => {
    let boleto = boletos.find(b => b.id == req.params.id);

    if (!boleto) return res.status(404).json({ message: "Boleto no encontrado" });

    let concierto = conciertos.find(c => c.id == boleto.conciertoId);
    if (!concierto) return res.status(404).json({ message: "Concierto no encontrado" });

    let updatedData = req.body;
    if (updatedData.cantidad && updatedData.cantidad > 0) {
        let vendidos = totalBoletosVendidos(boleto.conciertoId, boleto.id);
        if (vendidos + updatedData.cantidad > concierto.max_boletos)
            return res.status(400).json({ message: "Concierto no tiene boletos suficientes" });
        boleto.cantidad = updatedData.cantidad;
    }

    if (updatedData.comprador) boleto.comprador = updatedData.comprador;

    res.status(200).json(boleto);
});

app.delete('/boletos/:id', (req, res) => {
    let index = boletos.findIndex(b => b.id == req.params.id);
    if (index !== -1) {
        boletos.splice(index, 1);
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
