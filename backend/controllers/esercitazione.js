const { use } = require("react")

function createMultiplier(factor) {
    return function (argomento) {
        return (
            argomento * factor)
    }
}

function makeCounter(start = 0) {
    let count = start
    return {
        increment() { ++count },

        decrement() {
            count = count - 1
        },
        getValue() {
            count
        }
    }
}

const prodotti = [
    { nome: 'Laptop', prezzo: 999, cat: 'tech' },
    { nome: 'Libro', prezzo: 25, cat: 'edu' },
    { nome: 'Cuffie', prezzo: 89, cat: 'tech' },
    { nome: 'Pen', prezzo: 5, cat: 'edu' }
];

const nomi = prodotti.map(item => item.nome)
const filtro = prodotti.filter(p => p.prezzo < 100)
const somma = prodotti.reduce(((totale, p) => totale = totale + p.prezzo), 0)
const costoso = prodotti.reduce((max, corrente) => corrente.prezzo > max ? corrente : max)


async function alarm(name, delay) {
    return new Promise((resolve, reject)=>{
        if (delay < 0) {
            reject(new Error("Errore"));
            return
        }
        else setTimeout(() => {
            resolve(console.log("Wake up, ${name}"))}
            , delay)
    })
}


alarm("giovanni", 2000)
    .then(msg=>console.log(msg))
    .catch(err=>console.error(err.message))

async function getUserPosts(userId){
    const utenteRes=await fetch('/api/userId=<id')
    if(!utenteRes) throw new Error('Utente non trovato')
        const user=await utenteRes.json();
    const postRes=await fetch('/api/posts)userId=<id')
    if(!postRes) throw new Error('Post non trovati');
    const post=await postRes.json();
    return {user,posts}
    
}

//Scrivi due middleware:
//1. logger: stampa su console metodo, URL e timestamp di ogni richiesta. Si applica a tutte le route.
//2. requireAuth: verifica che ci sia un header x-api-key: secret123. Se assente o errato, risponde con 
// 401. Usato solo su route protette.

const express=require('express');
const app=express();
app.use(express.json());

const Logger=(req,res,next)=>{
    console.log(req.method);
    console.log(req.url);
    console.log(newDate().toISOString())
    next();
}
app.use(logger);

const requireAuth=(req,res,next)=>{
    const api=req.headers['x-api-key'];
    if(!api===secret123){
        return res.status(401).json('errore:key non valida')
    }
    next();
}
app.use(requireAuth);

//Crea un'API REST per gestire una lista di studenti salvati in un array in memoria (senza database). 
// Implementa: GET /studenti, GET /studenti/:id, POST /studenti, PUT /studenti/:id, DELETE /studenti/:id.

const express=require('express');
const app=express();
app.use(express.json())

let studenti = [
  { id: 1, nome: 'Giovanni', voto: 28 },
  { id: 2, nome: 'Mario',    voto: 30 }
];

app.get('/studenti',(req,res)=>{
    res.json(studenti);
})

app.get('/studenti/:id',(req,res)=>{
    const s=studenti.find()
    res.json(s)
}
)

//Definisci uno schema Mongoose per un libro di una biblioteca con i seguenti campi e vincoli:
//— titolo: stringa, obbligatoria, trim
//— autore: stringa, obbligatoria
//— isbn: stringa, univoca
//— anno: numero, tra 1000 e 2100
//— genere: uno tra 'romanzo', 'saggio', 'tecnico', 'altro'
//— disponibile: booleano, default true
//— createdAt: data, default ora corrente

const mongoose=require('mongoose');

const schema=new mongoose.Schema({
    titolo:{
        type:String,
        required,
        trim:true
    },
    autore:{
        type:String,
        required
    },
    isbn:{
        type:String,
        unique
    },
    anno:{
        type:Number,
        min:1000,
        max:2100
    }
})

const express=require('express');
const app=express();
app.use(express.json());

const Controller=(req,res,next)=>{
    const {nome,prezzo}=req.body
    if(!prezzo || !nome){
        return res.status(404).json('non trovato')
    }
   const nuovoProdotto={
    nome:nome,
    prezzo:prezzo
   }
   prodotti.push(nuovoProdotto);

    next();

}

//Devi creare il form in cui l'utente aggiorna le sue misurazioni corporee nella dashboard di GYM8.

import React from 'react';
import {useState} from 'react';

const [form,setForm]=useState({altezza:'', peso:''})

const HandleRefresh=(e)=>{
    const {name,value}=e.target;
    setForm(prev=>({
        ...prev,
        [name]:value
    }))
}

function Ciao(){

    return(
        <ul>
            {
                corsi.map(c=>{
                    <li key={c.id}>
                        {c.nome}
                    </li>
                })
            }
        </ul>
    )
}

const mongoose=require('mongoose');

const abbonamentoSchema=new mongoose.Schema[{
    tipo:{
        type:String,
        trim:true
    },
    prezzo:{
        type:Number,
        required:true
    },
    attivo:{
        type:Boolean,
        default:true
    }
}];

module.exports=mongoose.model('abbonamento',abbonamentoSchema)

async function handleLogin(e){
    e.preventDefault();
    const risposta=await fetch('/api/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(credenziali)
    })
    if(!risposta){
        res.status(400).json({error})
    }
}


const checkAuthHeader=(req,res,next)=>{
    const risposta=req.headers['authorization'];
    if(!risposta){
        res.status(401).json({error})
    }
    next();
}

