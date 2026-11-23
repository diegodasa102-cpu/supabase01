require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com o Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// LISTAR TODOS OS PRODUTOS
app.get('/products', async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
});

// CONSULTAR PRODUTO PELO ID
app.get('/products/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data) {
        return res.status(404).json({
            message: 'Produto não encontrado'
        });
    }

    res.status(200).json(data);
});

// CADASTRAR PRODUTO
app.post('/products', async (req, res) => {
    const { name, description, price } = req.body;

    if (!name || description === undefined || price === undefined) {
        return res.status(400).json({
            error: 'Nome, descrição e preço são obrigatórios'
        });
    }

    const { data, error } = await supabase
        .from('products')
        .insert({
            name,
            description,
            price
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
});

// ATUALIZAR PRODUTO
app.put('/products/:id', async (req, res) => {
    const { name, description, price } = req.body;

    if (!name || description === undefined || price === undefined) {
        return res.status(400).json({
            error: 'Nome, descrição e preço são obrigatórios'
        });
    }

    const { data, error } = await supabase
        .from('products')
        .update({
            name,
            description,
            price
        })
        .eq('id', req.params.id)
        .select()
        .maybeSingle();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data) {
        return res.status(404).json({
            message: 'Produto não encontrado'
        });
    }

    res.status(200).json(data);
});

// EXCLUIR PRODUTO
app.delete('/products/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id)
        .select()
        .maybeSingle();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data) {
        return res.status(404).json({
            message: 'Produto não encontrado'
        });
    }

    res.status(200).json({
        message: 'Produto excluído com sucesso'
    });
});

// ROTA INICIAL
app.get('/', (req, res) => {
    res.send('Hello! Supabase API is working!');
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor funcionando na porta ${PORT}`);
});
