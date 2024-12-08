import {connexion} from '../db/db.js';

/**
 * Retourne l'ensemble des echanges.
 * @returns L'ensemble des echanges.
 */
export async function getAllExchanges() {
    
        const echanges = await connexion.all(
            `SELECT e.id_echange, e.nom_echange, u.nom AS utilisateur_nom, u.prenom AS utilisateur_prenom
            FROM echange e
            JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur`
        );
        return echanges;
   
};

/**
 * fontction permettant de retouver les echanges d'un utilisatuer spécifié
 * @returns l'echange de l'utilisateur connecté
 */

export async function getUserExchanges(id) {
       
        const requete = 
            `SELECT e.id_echange, e.nom_echange, u.nom AS nom_utilisateur, u.prenom

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
   
     const result = await connexion.run(
            `DELETE FROM echange WHERE id_echange = ?;
            DELETE FROM echange_brique WHERE id_echange = ?`, 
            [echangeId]);
        return result.changes > 0;    
};

/**
 * méthode permettant la récuperation de toutes briques se trouvant dans la table
 * @returns {briques} les briques
 */
export async function getAllBriques() {
    const briques = await connexion.all(`
        SELECT brique.id_brique, brique.nom, brique.image, brique.valeur, couleur.nom AS couleur
        FROM brique
        LEFT JOIN couleur ON brique.id_couleur = couleur.id_couleur
    `);
    return briques;
};



/**
 * Fonction permettant de créer un échange
 * @param {string} nomEchange - Le nom de l'échange
 * @param {Array} briques  Liste des briques à échanger avec leur ID et quantité
 * @returns {number} retourne l'id de l'échange créé
 */
export async function createExchange(id,nomEchange, briques) {
    
        const requete = `INSERT INTO echange (id_utilisateur, nom_echange) VALUES (?, ?)`;
        const result = await connexion.run(
            requete,[id, nomEchange]
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
export async function getEchangeDetails(idEchange) {
    const result = await connexion.all(
        `
        SELECT 
                e.nom_echange AS nomEchange,
                u.nom AS nomUtilisateur,
                u.prenom AS prenomUtilisateur,
                b.nom AS nomBrique,
                b.image AS imageBrique,
                b.valeur AS valeurBrique,
                eb.quantite AS quantiteBrique
            FROM echange e
            JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
            JOIN echange_brique eb ON e.id_echange = eb.id_echange
            JOIN brique b ON eb.id_brique = b.id_brique
            WHERE e.id_echange = ?
        `, [idEchange]
    );

    const valeurglobale = await calculValeurGlobaleApprox(idEchange)

    const echanges =  result.reduce((acc, row) => {
        // Vérifie si l'échange existe déjà dans le tableau accumulé
        let echange = acc.find(e => e.nomEchange === row.nomEchange);
        
        if (!echange) {
            echange = {
                nomEchange: row.nomEchange,
                nomUtilisateur: `${row.prenomUtilisateur} ${row.nomUtilisateur}`,
                briques: [],
                valeurGlobale : valeurglobale
            };
            acc.push(echange);
        }
        
        // Ajoute la brique actuelle au tableau des briques de cet échange
        echange.briques.push({
            nomBrique: row.nomBrique,
            imageBrique: row.imageBrique,
            quantiteBrique: row.quantiteBrique,
            valeurBrique : row.valeurBrique
        });
        
        return acc;
    }, []);

    return echanges;
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

