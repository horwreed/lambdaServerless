const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');


const PET_TABLE = "pet_table";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

age_factors = {
'<1' : 1.01 ,
'1' : 1.015 ,
'2' : 1.019 ,
'3' : 1.024 ,
'4' : 1.028 ,
'5' : 1.03 ,
'6' : 1.034 ,
'7' : 1.038 ,
'8' : 1.044 ,
'>8' : 1.055
}

zipcode_factors = {
'90210' : 1.01 ,
'10001' : 1.015 ,
'02481' : 1.019 ,
'11217' : 1.024 ,
'DEFAULT' : 1.013
}

dog_breed_factors = {
'golden_retriever' : 1.01 ,
'dachshund' : 1.015 ,
'chesapeake_bay_retriever' : 1.002 ,
'DEFAULT' : 1.005
}

cat_breed_factors = {
'siamese' : 1.01 ,
'maine_coon' : 1.015 ,
'ragdoll' : 1.002 ,
'DEFAULT' : 1.005
}

species_factors = {
'dog' : 1 ,
'cat' : 0.99
}

const BASE_PRICE = 45

function getFactorOrDefault(input, factors) {
    if (input in factors) {
        return factors[input];
    } else {
        return factors['DEFAULT'];
    }
}

function calculateQuote(age, zipcode, breed, species) {
    var age_factor;
    var zipcode_factor;
    var breed_factor;
    var species_factor;

    if (Number(age) < 1) {
        age = '<1';
    }
    if (Number(age) > 8) {
        age = '>8';
    }
    age_factor = age_factors[age];
    zipcode_factor = getFactorOrDefault(zipcode, zipcode_factors);

    if (species == 'dog') {
        species_factor = species_factors[species];
        breed_factor = getFactorOrDefault(breed, dog_breed_factors);
    } else if (species == 'cat') {
        species_factor = species_factors[species];
        breed_factor = getFactorOrDefault(breed, cat_breed_factors);
    } else {
        throw "Cannot calculate quote for species other than dogs and cats";
    }

    return BASE_PRICE * (age_factor + zipcode_factor + breed_factor + species_factor);
}

// Get Quote endpoint
app.get('/quote/:petId', function (req, res) {
  const params = {
    TableName: PET_TABLE,
    Key: {
      petId: req.params.petId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get quote' });
    }
    if (result.Item) {
      const { age, zipcode, breed, species } = result.Item;
      try {
        var quote = calculateQuote(age, zipcode, breed, species);
        res.json({ quote });
      }
      catch(err) {
        res.status(400).json({ error: 'Could not calculate quote: ' + err});
      }
    } else {
      res.status(404).json({ error: "Pet not found" });
    }
  });
})

//Get Pet endpoint
app.get('/pet/:petId', function(req, res) {
    const params = {
    TableName: PET_TABLE,
    Key: {
      petId: req.params.petId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get quote' });
    }
    if (result.Item) {
      const { petId, age, breed, zipcode, name, gender, species } = result.Item;
      try {
        var quote = calculateQuote(age, zipcode, breed, species);
        res.json({ petId, age, breed, zipcode, name, gender, species });
      }
      catch(err) {
        res.status(400).json({ error: 'Could not calculate quote: ' + err});
      }
    } else {
      res.status(404).json({ error: "Pet not found" });
    }
  });
})

// Create Pet endpoint
app.post('/pet', function (req, res) {
  const { petId, age, breed, zipcode, name, gender, species } = req.body;

  //Maybe worth validating input before putting it in the db

  const params = {
    TableName: PET_TABLE,
    Item: {
      petId: petId,
      age: age,
      breed: breed,
      zipcode: zipcode,
      name: name,
      gender: gender,
      species: species
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create pet' });
    }
    res.json({ petId, name });
  });
})

module.exports.handler = serverless(app);