document.querySelector(".range").addEventListener('mousemove', () => {
    if (Number(document.querySelector('.range').value) > 5) {
        document.querySelector(".line__number").textContent = 6
    }
    if (Number(document.querySelector('.range').value) > 6) {
        document.querySelector(".line__number").textContent = 5
    }

    if (Number(document.querySelector('.range').value) > 7) {
        document.querySelector(".line__number").textContent = 4
    }

    if (Number(document.querySelector('.range').value) > 8) {
        document.querySelector(".line__number").textContent = 3
    }

    if (Number(document.querySelector('.range').value) > 9) {
        document.querySelector(".line__number").textContent = 2
    }

    if (Number(document.querySelector('.range').value) >= 10) {
        document.querySelector(".line__number").textContent = 1
    }
})