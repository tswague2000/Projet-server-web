/**
 * fonction permettant la validation de l'id
 * @param {number} id 
 * @returns la verification la conformité de l'id 
 */
export const validateId = (id) =>
     typeof id === 'number' &&
    !Number.isNaN(id) &&
    Number.isFinite(id) &&
    id > 0;
 /**
  * fonction permettant la validation du nom de l'échange
  * @param {string} nameEchange 
  * @returns la verification de la conformité de nom de l'échange
  */   
export const validateName = (nameEchange)=>
    typeof nameEchange === 'string' &&
    nameEchange.length >= 2 &&
    nameEchange.length <= 200;

    /**
     * fonction permettant de verifier qu'il s'agit d'une table de briques
     * @param {Array} briques 
     * @returns true ou false si s'agit d'un tableau ou pas 
     */
export const validateBriques = (briques) =>{

    if(Array.isArray(briques)){
        let check = false;
        for (const brique of briques) {
            const id_brique = brique.id_brique;
            const quantite = brique.quantite;
            
            if((typeof id_brique === 'number' && !Number.isNaN(id_brique) && Number.isFinite(id_brique) &&id_brique > 0
            ) &&(typeof quantite === 'number' && !Number.isNaN(quantite) && Number.isFinite(quantite) && quantite > 0)){
                check = true;
            }
            else{
                check = false  
           }
        }
        return check;
    }      
};




