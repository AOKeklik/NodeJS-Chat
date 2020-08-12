    const http = require('http')
    const express = require('express')//EXPRESS OLSTRDUK
    const app = express()//EXPRESS 
    const server = http.createServer(app)//SERVER OLSTRURDU
    const io = require('socket.io').listen(server)//socketio DAHILEDILDI
    const bodyparser = require('body-parser')//POST ISLEMLERIICIN
    const sharedsession = require('express-socket.io-session')
    const fs = require('fs')

    app.use(bodyparser.urlencoded({extended: false}))//bodyparser BASLATILDI

    const session = require('express-session')({//SESSION OLSTR
        secret: "chatsistem",//SESSION ANAHTR
        resave: false,//OTURM ISLEMLERINDEKI DEGISIKLIKLERIN OTOMATIK KAYDEDILMESI
        saveUninitialized: false//BASLATILMAMIS BIR OTURUMU SISTEME KAYDETMEYE ZORLAR
    })

    app.use(session)
    io.use(sharedsession(session,{
        autoSave: true//SOCET IO SESSION DEGISKLIKLERINI OTOMATIK KAYITEDER
    }))

    app.use('/css',express.static(__dirname + '/node_modules/bootstrap/dist/css'))//BOOTSTRAP DIZINYOLU
    app.use('/jquery',express.static(__dirname + '/node_modules/jquery/dist'))//JQUERY DIZINYOLU

   
    app.get('/oturumac', function(request, response){
        //response.writeHead(200, {'Content-type': 'text/html; charset=utf8'})
        request.session.kullaniciadi = 'olcay'
        request.session.yas = 22
        response.write('Oturum ' + request.session.kullaniciadi)
        response.end()
    })
    app.get('/oturumbak', function(request, response){
        if(request.session.kullaniciadi){
            response.write('1. Oturum Var..')
        }else{
            response.write('1. Oturum Yok..')
        }

        if(request.session.yas){
            response.write('2. Oturum Var..')
        }else{
            response.write('2. Oturum Yok..')
        }
        response.end()
    })
    app.get('/oturumsil', function(request, response){
        //request.session.destroy()//TUM SESSION LARI SILER
        delete request.session.kullaniciadi
        response.end()
    })

    app.get('/', function(request, response){
        if(!request.session.kullaniciadi){
            response.sendFile('index.html', {root: __dirname})//SESSION YOKSA
        }else{
            response.sendFile('chat.html', {root: __dirname})//SESSION VARSA
        }
    })
    app.post('/chat', function(request, response){
        if(request.body.kulad){
            request.session.kullaniciadi = request.body.kulad
        }
        if(request.session.kullaniciadi){
            response.sendFile('chat.html', {root: __dirname})//SESSION YOKSA
        }else{
            response.sendFile('index.html', {root: __dirname})//SESSION VARSA
        }
    })

    io.on('connection', function(socket){//socketio BASLATILDI
        // input VE output KISMINA BAGLANTI DURUMUNU KONTROL EDIYOR
        console.log('Bir Kullanici Baglandi..' + socket.handshake.session.kullaniciadi)

        socket.on('mesajvar', function(msg){//EGER ACIK KANALDAN BIRISI mesajvar GONDERIRSE BUNU YAKALIYORUZ
            io.emit('mesajvar', socket.handshake.session.kullaniciadi, msg)
            //YAKALADGMZ mesajvar I BIZE BAGLI OLAN TUM ACIK KANALLARA emit (YAYILMA) EDIYORUZ
            //BIRDEN FAZLA KULLANICI VARSA ACIKTA OLAN TUM KANALLARA mesajvar I ILETMIS OLUYORUZ
        })
        socket.on('disconnect', function(){
            console.log('Bir Kullanici Ayrildi..')
        })
        socket.on('konusmakaydet', function(konusmalar){
            var bosluksil = konusmalar.trim()
            var parcalihali = bosluksil.split('*')
            var sonhal = parcalihali.join('\n')

            fs.writeFile('konusmalar.txt', konusmalar, function(err){
                if(err) throw err
                else console.log('Veriler Kaydedildi..')
            })
        })
    })




    server.listen(8000)//HANGI port DA CALISACK


