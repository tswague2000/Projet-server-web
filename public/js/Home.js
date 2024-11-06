// ajout d'un evenement click sur le bouton créer échange dans la page d'accueil 
document.getElementById('btn-createExchange').addEventListener('click',function(){
    window.location.href='/createEchange'
});
// ajout d'un evenement click sur le logo de la page d'accueil
document.getElementById('logo-link').addEventListener('click',function(){
    window.location.href='/';
});
// ajout d'un evenement click sur le bouton verifier l'échange dans la page d'accueil 
document.getElementById('btn_verifyExchange').addEventListener('click',function(){
    window.location.href='/echange';
});

