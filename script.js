let chart;

// 1. Fungsi Evaluasi Matematika
function f(expr, x) {
    expr = expr.replace(/−/g, "-").replace(/–/g, "-").replace(/—/g, "-");
    return math.evaluate(expr, { x: x });
}

// 2. Fungsi Utama Perhitungan
function hitungBisection() {
    let expr = document.getElementById("fungsi").value;
    let a = parseFloat(document.getElementById("a").value);
    let b = parseFloat(document.getElementById("b").value);
    let tol = parseFloat(document.getElementById("tol").value);
    let maxIter = parseInt(document.getElementById("maxIter").value);

    const aAsli = a;
    const bAsli = b;
    const tbody = document.getElementById("tbodyIterasi");
    tbody.innerHTML = "";

    let listTitikIterasi = [];

    try {
        let fa = f(expr, a);
        let fb = f(expr, b);

        if (fa * fb > 0) {
            alert("f(a) dan f(b) harus berbeda tanda.");
            return;
        }

        let c, fc;
        let iter = 0;
        let cLama = null;
        let galatRelatifAkhir = "0.000000000";

        while (iter < maxIter) {
            c = (a + b) / 2;
            fc = f(expr, c);
            fa = f(expr, a);
            fb = f(expr, b);

            listTitikIterasi.push({ x: c, y: fc });

            let lebarRentang = Math.abs(b - a) / 2;
            let galatRelatifTeks = "";
            
            if (cLama !== null) {
                let gr = Math.abs((c - cLama) / c);
                galatRelatifTeks = gr.toFixed(9);
                galatRelatifAkhir = galatRelatifTeks;
            }

            let rentangBaru = "";
            let aPrev = a;
            let bPrev = b;

            if (fa * fc < 0) {
                rentangBaru = "a,c";
                b = c;
            } else {
                rentangBaru = "c,b";
                a = c;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${iter}</td>
                    <td>${aPrev.toFixed(6)}</td>
                    <td>${bPrev.toFixed(6)}</td>
                    <td class="fw-bold text-primary">${c.toFixed(6)}</td>
                    <td>${fa.toFixed(6)}</td>
                    <td>${fb.toFixed(6)}</td>
                    <td>${fc.toFixed(6)}</td>
                    <td>${rentangBaru}</td>
                    <td>${lebarRentang.toFixed(6)}</td>
                    <td>${galatRelatifTeks}</td>
                </tr>`;

            if (lebarRentang < tol || Math.abs(fc) < tol) {
                iter++;
                break;
            }

            cLama = c;
            iter++;
        }

        document.getElementById("hasil").innerHTML = `
            <div class="alert alert-success">
                <h4>Hasil Perhitungan</h4>
                <b>Akar ≈ ${c.toFixed(8)}</b><br>
                f(Akar) = ${fc.toFixed(6)}<br>
                Jumlah Iterasi = ${iter}<br>
                Error Akhir = ${galatRelatifAkhir}
            </div>`;

        gambarGrafik(expr, c, aAsli, bAsli, listTitikIterasi);
    } 
    catch (err) {
        alert("Fungsi tidak valid!");
    }
}

// 3. Fungsi Visualisasi Grafik (Versi Final)
function gambarGrafik(expr, akar, a, b, titikIterasi) {
    let dataKurva = [];
    let xmin = a - Math.abs(b - a) * 0.5;
    let xmax = b + Math.abs(b - a) * 0.5;
    let step = (xmax - xmin) / 100 || 0.01;

    let ymin = Infinity;
    let ymax = -Infinity;

    for (let x = xmin; x <= xmax; x += step) {
        try {
            let yVal = f(expr, x);
            if (isFinite(yVal)) {
                dataKurva.push({ x: x, y: yVal });
                ymin = Math.min(ymin, yVal);
                ymax = Math.max(ymax, yVal);
            }
        } catch (e) {}
    }

    // Trik Filter agar titik biru tidak menutupi titik orange
    let filteredIterasi = titikIterasi.filter((pt, idx) => {
        if (idx < 5) return true; // Tampilkan 5 iterasi pertama
        return Math.abs(pt.x - akar) > Math.abs(b - a) * 0.02; // Sembunyikan yang terlalu dekat akar
    });

    const ctx = document.getElementById("grafik");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        data: {
            datasets: [
                {
                    type: 'line',
                    label: 'Garis Akar',
                    data: [{ x: akar, y: ymin - 5 }, { x: akar, y: ymax + 5 }],
                    borderColor: '#eb4d4b',
                    borderDash: [5, 5],
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                },
                {
                    type: 'line',
                    label: `f(x) = ${expr}`,
                    data: dataKurva,
                    borderColor: '#2e86de',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },
                {
                    type: 'scatter',
                    label: 'Titik Iterasi',
                    data: filteredIterasi,
                    backgroundColor: '#2980b9',
                    borderColor: '#fff',
                    borderWidth: 1,
                    pointRadius: 5
                },
                {
                    type: 'scatter',
                    label: `Akar ≈ ${akar.toFixed(5)}`,
                    data: [{ x: akar, y: 0 }],
                    backgroundColor: '#f39c12', // Orange
                    borderColor: '#fff',
                    borderWidth: 2,
                    pointRadius: 9, // Besar agar menonjol
                    order: -1 // Paling depan
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { type: 'linear', title: { display: true, text: 'x' } },
                y: {
                    title: { display: true, text: 'f(x)' },
                    grid: {
                        color: (c) => c.tick.value === 0 ? '#000' : 'rgba(0,0,0,0.05)',
                        lineWidth: (c) => c.tick.value === 0 ? 1.5 : 1
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => ctx.dataset.label.includes('Garis') ? null : 
                                       `${ctx.dataset.label}: (x: ${ctx.parsed.x.toFixed(5)}, y: ${ctx.parsed.y.toFixed(5)})`
                    }
                }
            }
        }
    });
}