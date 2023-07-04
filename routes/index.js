var express = require('express');
var router = express.Router();
const Transport = require('../models/transports')
const Client = require('../models/clients')
const Tarif = require('../models/tarifs')
const Taxe = require('../models/conditionstaxations')
const Localite = require('../models/localites')

router.get('/client', async (req, res) => {
  const allCLient = await Client.find()
  const names = []
  let num = 1
  for(let client of allCLient) {
    names.push({
      value: num,
      label: client.raisonSociale
    })
    num += 1
  }
  res.json({names})
})


router.post("/tarifAndTaxe", async (req, res) => {
  const {
    destinataire,
    expediteur,
    whoPaid,
    nbColis,
    poids
  } = req.body
  console.log(expediteur)
  
  // chercher dans Client le destinataire
  const destinataireClient = await Client.find({ raisonSociale: destinataire });
  
  // Récupérer les infos du client
  const {
    codePostal,
    idClient,
    ville
  } = destinataireClient[0]
  
  console.log('whopaid ==>', whoPaid)
  // TAXE maintenant que nous avons l'id du destinataire
  let taxeFinale 
  if(whoPaid === 'expediteur') {
    const expediteurCLient = await Client.find({ raisonSociale: expediteur })
    console.log(expediteurCLient)
    const idExpediteur = expediteurCLient[0].idClient
    console.log('id expe ==>',idExpediteur)

    let taxeCondition = await Taxe.find({ idClient: idExpediteur })
    let taxeGeneraleCondition = await Taxe.find({idClient: { $nin: [ 1, 2 ] }})
    console.log('taxe condition expe', taxeCondition)
    if(!taxeCondition.length) {
      taxeFinale = taxeGeneraleCondition[0].taxePortPaye
    }

    if(taxeCondition.length) {
      if(taxeCondition[0].useTaxePortPayeGenerale) {
        taxeFinale = taxeGeneraleCondition[0].taxePortPaye
      } else {
        taxeFinale = taxeCondition[0].taxePortPaye
      }
    }
  } else if(whoPaid === 'destinataire') {
    let taxeCondition = await Taxe.find({ idClient: idClient })
    let taxeGeneraleCondition = await Taxe.find({idClient: { $nin: [ 1, 2 ] }})
    console.log('taxe condition desti', taxeCondition, idClient)

    if(!taxeCondition.length) {
      taxeFinale = taxeGeneraleCondition[0].taxePortDu
    }

    if(taxeCondition.length) {
      if(taxeCondition[0].useTaxePortDuGenerale) {
        taxeFinale = taxeGeneraleCondition[0].taxePortDu
      } else {
        taxeFinale = taxeCondition[0].taxePortDu
      }
    }
  }

  // ZONE
  // recherche localisation du destinataire
  const destinataireLocalite = await Localite.find({ codePostal, ville });
  // zone
  const destinataireZone = destinataireLocalite[0].zone
  
  console.log('infos destinataire ==>', destinataireClient, destinataireLocalite )

  // RECHERCHE TARIF 
  // rechercher et zone - 1 si existe pas dans la zone
  const tarif = await Tarif.find({
    $or: [
      { idClient: idClient, codeDepartement: codePostal, zone: destinataireZone },
      { idClient: idClient, codeDepartement: codePostal, zone: destinataireZone - 1 },
    ],
  });

  if(tarif.length) {
    // si pas d'id héritage
    if(!tarif[0].idClientHeritage) {
      if(tarif.length > 1) {
        const tarifFilter = tarif.filter((e) => e.zone === destinataireZone)
        res.json({result: true, tarif: tarifFilter, taxe: taxeFinale})
      } else {
        res.json({result: true, tarif: tarif, taxe: taxeFinale})
      }
    }
    // SI ID HERITE
    if(tarif[0].idClientHeritage) {
      const idClientHeritage = tarif[0].idClientHeritage
      const tarifHerite = await Tarif.find({
        $or: [
          { idClient: idClientHeritage, codeDepartement: codePostal, zone: destinataireZone },
          { idClient: idClientHeritage, codeDepartement: codePostal, zone: destinataireZone -1 },
        ],
      });

      if(tarifHerite.length) {
        if(tarifHerite.length > 1) {
          const tarifFilterHerite = tarif.filter((e) => e.zone === destinataireZone)
          res.json({result: true, tarif: tarifFilterHerite, taxe: taxeFinale})
        } else {
          res.json({result: true, tarif: tarifHerite, taxe: taxeFinale})
        }
      }
      // tarif général si pas de résultat
      if(!tarifHerite.length) {
        const tarifGeneralHerite = await Tarif.find({
          $or: [
            { idClient: 0, codeDepartement: codePostal, zone: destinataireZone },
            { idClient: 0, codeDepartement: codePostal, zone: destinataireZone - 1},
          ],
        });

        if(tarifGeneralHerite.length) {
          res.json({result: true, tarif: tarifGeneralHerite, taxe: taxeFinale})
        } else {
          res.json({result: false, error: 'pas de tarif général / hérité avec id, zone et département !'})
        }
      }
    }
  }
  // tarif général si pas de résultats
  if(!tarif.length) {
    const tarifGeneral = await Tarif.find({
      $or: [
        { idClient: 0, codeDepartement: codePostal, zone: destinataireZone },
        { idClient: 0, codeDepartement: codePostal, zone: destinataireZone - 1},
      ],
    });

    if(tarifGeneral.length) {
      if(tarifGeneral.length > 1 ) {
        const tarifGeneralFilter = tarifGeneral.filter((e) => e.zone === destinataireZone)
        res.json({result: true, tarif: tarifGeneralFilter, taxe: taxeFinale})
      } else {
        res.json({result: true, tarif: tarifGeneral, taxe: taxeFinale})
      }
    } else {
      res.json({result: false, error: 'pas de tarif général !'})
    }
  }

})

router.post('/newTransport', async (req, res) => {
  const {
    destinataire,
    expediteur,
    whoPaid,
    nbColis,
    poids,
    tarifHT,
    taxe,
    total
  } = req.body

  Transport.create({
    destinataire,
    expediteur,
    whoPaid,
    nbColis,
    poids,
    tarifHT,
    taxe,
    total
  })

  res.json({
    result: true,
    message: "Commande réalisée avec succès",
  });
})

module.exports = router;
