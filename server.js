const port = 8000;
const fs = require('fs');
const http = require("http");
const path = `${__dirname}/index.html`;
const { parse } = require('querystring');

function collectRequestData(request, callback) {
  const FORM_URLENCODED = 'application/x-www-form-urlencoded';

  if (request.headers['content-type'] === FORM_URLENCODED) {
    let body = '';

    request.on('data', chunk => {
      body += chunk.toString();
    });

    request.on('end', () => {
      callback(parse(body));
    });
  }
  else {
    callback(null);
  }
}

function getTemplate(body){
  return `
    <!DOCTYPE html>
    <html lang="pt-br">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
        <title>Calculadora IMC</title>
      </head>
      <body class="m-5">
        <div class="col-md-4"> 
          <div class="alert alert-primary" role="alert">
            ${body}
          </div>
        </div>
      </body>
    </html>
  `;
}

function getMessage(imcValue, imcClassification){
  return getTemplate(`<p>Seu imc é ${imcValue}, e você está ${imcClassification}</p>`);
}

function getImc(weight, height) {
  return (weight / Math.pow(height,2)).toFixed(2);
}

function getClassificationIMC(weight, height) {
  const imc = getImc(weight, height);

  if (imc < 18.5) {
    return getMessage(imc, "abaixo do peso");
  }

  if (imc >= 18.5  && imc <= 24.9) {
    return getMessage(imc, "com o peso normal");
  }

  if (imc >= 25 && imc <= 29.9 ) {
    return getMessage(imc, "com sobre peso");
  }

  if (imc >= 30) {
    return getMessage(imc, "com obesidade");
  }
} 

const requestListener = function (req, res) {
  if (req.method === 'POST') {
    collectRequestData(req, result => {  
      res.end(`${getClassificationIMC(result.weight, result.height)}`);
    });
  } else {
    try {
      if (fs.existsSync(path)) {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        const file = fs.readFileSync(path);
        res.end(file);
      }
    } catch(err) {
      console.error(err)
    } 
  }
};

const server = http.createServer(requestListener);
server.listen(port, () => {
  console.log(`Server is running on http://localhost/${port}`);
});