const core1 = document.querySelector('.core1');
const core2 = document.querySelector('.core2');
const core3 = document.querySelector('.core3');
let pc1 = document.querySelector('.pc1');
let pc2 = document.querySelector('.pc2');
let pc3 = document.querySelector('.pc3');

core1.addEventListener('click', function() {
    pc1.style.display = 'flex';
    core1.style.background = 'chocolate';
    core2.style.background = 'whitesmoke';
    core3.style.background = 'whitesmoke';
    pc2.style.display = 'none';
    pc3.style.display = 'none';
});
core2.addEventListener('click', function() {
    pc2.style.display = 'flex';
    core2.style.background = 'chocolate';
    core1.style.background = 'whitesmoke';
    core3.style.background = 'whitesmoke';
    pc1.style.display = 'none';
    pc3.style.display = 'none';
});
core3.addEventListener('click', function() {
    pc3.style.display = 'flex';
    core3.style.background = 'chocolate';
    core1.style.background = 'whitesmoke';
    core2.style.background = 'whitesmoke';
    pc1.style.display = 'none';
    pc2.style.display = 'none'
});

let spanBoxs = document.querySelectorAll('#accordion_head span')

spanBoxs.forEach(spanBox => {
    spanBox.addEventListener('click', function(){
        let spanBoxparent = this.parentElement;
        let accordionHeadParent = spanBoxparent.parentElement;
        accordionHeadParent.children[1].classList.toggle('active');
        
    })
});
