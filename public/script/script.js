window.onload=function(){
   const hamburger = document.getElementsByClassName("menu_hamburger")[0]; //dato che restituisce una lista di elementi 'HTMLCollection' prendo il primo elemento 
    const links = document.getElementsByClassName("collegamenti")[0];
    hamburger.addEventListener('click',()=> {
        if(links.classList.contains('attivo')){
            links.classList.remove('attivo');
            hamburger.src = "/img/hamburger.png";
        }else{
            links.classList.add("attivo");
            hamburger.src = "/img/close.png";
        }
    });
}
