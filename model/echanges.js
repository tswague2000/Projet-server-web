import {connexion} from '../db/db.js';

/**
 * Retourne l'ensemble des echanges.
 * @returns L'ensemble des echanges.
 */
export async function getAllExchanges() {
    
        const echanges = await connexion.all(
            `SELECT e.id_echange, e.nom_echange, u.nom AS utilisateur_nom, u.prenom AS utilisateur_prenom, b.nom AS brique_nom, eb.quantite 
            FROM echange e
            JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
            LEFT JOIN echange_brique eb ON e.id_echange = eb.id_echange
            LEFT JOIN brique b ON eb.id_brique = b.id_brique`
        );
        return echanges;
   
};

/**
 * fontction permettant de retouver les echanges d'un utilisatuer spécifié
 * @returns l'echange de l'utilisateur 1
 */

export async function getUserExchanges(id) {
       
        const requete = 
            `SELECT e.id_echange, e.nom_echange, u.nom AS nom_utilisateur
                FROM echange e
                JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
                WHERE e.id_utilisateur = ?
            `;
            const echangeUser = await connexion.all(requete , [id]);
            return echangeUser;

    
};

/**
 * fonction permettant de supprimer un échange se trouvant dans la table échange
 * @param {number} echangeId  suppression d'un echanges
 */

export async function deleteEchange(echangeId) {
   
        const requete = 
            `DELETE FROM echange WHERE id_echange = ?`;
        
        const result = await connexion.run(requete, 
            [echangeId]);
        return result.changes > 0;    
};

/**
 * méthode permettant la récuperation de toutes briques se trouvant dans la table
 * @returns {briques} les briques
 */
export async function getAllBriques() {
    
    const briques = await connexion.all(`SELECT id_brique, nom, image, valeur FROM brique`);
    return briques;
};


/**
 * Fonction permettant de créer un échange
 * @param {string} nomEchange - Le nom de l'échange
 * @param {Array} briques  Liste des briques à échanger avec leur ID et quantité
 * @returns {number} retourne l'id de l'échange créé
 */
export async function createExchange(nomEchange, briques) {
    
        const requete = `INSERT INTO echange (id_utilisateur, nom_echange) VALUES (?, ?)`;
        const result = await connexion.run(
            requete,[1, nomEchange]
        );

        const exchangeId = result.lastID;

        for (const brique of briques) {
            const id_brique = brique.id_brique;
            const quantite = brique.quantite;

                await connexion.run(
                    `INSERT INTO echange_brique (id_echange, id_brique, quantite) VALUES (?, ?, ?)`,
                    [exchangeId, id_brique, quantite]
                );
            
        }

        return exchangeId; 
   
};
/**
 * fonction permettant de recupérer les détails d'un échange
 * @param {number} idEchange 
 * @returns un tableau des détails de l'échange
 */
export async function getEchangeDetails(idEchange){
  const result = await connexion.all(
    `
    SELECT 
            e.nom_echange AS nomEchange,
            u.nom AS nomUtilisateur,
            u.prenom AS prenomUtilisateur,
            b.nom AS nomBrique,
            b.image AS imageBrique,
            eb.quantite AS quantiteBrique
        FROM echange e
        JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
        JOIN echange_brique eb ON e.id_echange = eb.id_echange
        JOIN brique b ON eb.id_brique = b.id_brique
        WHERE e.id_echange = ?
    `,[idEchange]
  );
  return result.map(row => ({
    nomEchange: row.nomEchange,
    nomUtilisateur: `${row.prenomUtilisateur} ${row.nomUtilisateur}`,
    nomBrique: row.nomBrique,
    imageBrique: row.imageBrique,
    quantiteBrique: row.quantiteBrique
})) || [];
};

/**
 * fonction permettant de faire le calcul de la valeur approximmative de l'échange
 * @param {number} idEchange 
 * @returns la valeur globale approximmative de l'échange
 */

export async function calculValeurGlobaleApprox(idEchange) {

    const verificationRequete = `
        SELECT COUNT(*) AS count 
        FROM echange 
        WHERE id_echange = ?`;

    const verificationResultat = await connexion.get(verificationRequete, idEchange);
    if (verificationResultat.count === 0) {
        console.error(`Erreur : L'échange avec l'ID ${idEchange} n'existe pas ou est invalide.`);
        return null; 
    };
    const requete = `
        SELECT b.valeur, eb.quantite
        FROM echange_brique eb
        JOIN brique b ON eb.id_brique = b.id_brique
        WHERE eb.id_echange = ?`;

   
    const briques = await connexion.all(requete, idEchange);
    

    const valeurGlobale = briques.reduce((total, brique) => {
        return total + (brique.valeur * brique.quantite);
    }, 0);

    return valeurGlobale; 
}

