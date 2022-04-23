const axios = require('axios')

const url = 'https://gist.githubusercontent.com/lomefin/907bab0a42231d3ecaf4a2d4559b8e53/raw/bfdb5f2fbcbeb88e3b0ae5ec4f32fcd4aa5e768d/movements.txt'

/*
Se optimiza el código de la función getData
intenado aprovechar las caracteristicas de las funciones de los arreglos de javascript,
adicionalmente se añade otro parametro para hacer un busqueda mediante un expresión regular,
de la misma forma se retornan los datos parseados a un arreglo de objetos con su respectivas propiedades y tipo de dato
*/
const getData = async(url, tipoTransaccion) => {
    const re = new RegExp(`.*${tipoTransaccion}.*`, 'gi')
    const { data } = await axios.get(url)
    const transactionArray = data.split('\n')
    const transactions = transactionArray
        .map(e => e.split(',').map(e => e.trim()))
        .filter(e => e[1] !== undefined)
        .filter(e => re.test(e[1]))
        .map(e => {
            return {
                fecha: new Date(e[0]),
                tipo: e[1],
                haber: parseFloat(e[2]),
                deber: parseFloat(e[3])
            }
        })
    return transactions

}

/*
Se optimiza la función getSumaTotal , anteriomente se usaba el ciclo forEach,
ahora se utiliza un método mas acorde para hacer la suma de los datos(reduce).
Al igual que el caso anterior se añade otro paramentro para escoger que dato se quiere sumar
 */
const getSumaTotal = (data, tipo) => {
    return data.reduce((acc, cur) => {
        return acc + cur[tipo]
    }, 0)
}

/*
Solo se añade otro parametro
 */
const getPromedio = (data, tipo) => {
    return (getSumaTotal(data, tipo) / data.length)
}

/*
Las funciones getMin y getMax se modificaron y unificarón en una sola función que se encarga de devolver el máximo o mínimo
según el parametro que se le pase y el tipo de dato que se quiere obtener
 */
const getMaxMin = (data, maxOrMin, tipo) => {
    let max = -Infinity
    let min = Infinity
    data.forEach(element => {
        if (element[tipo] > max) {
            max = element[tipo]
        }
        if (element[tipo] < min) {
            min = element[tipo]
        }
    })
    if (maxOrMin === 'max') {
        return max
    } else {
        return min
    }
}

/*
Funcioón para optimizar la obtención de los tipos de transacción.
Separa los distintos tipos de transacciones y los retorna en un arreglo
*/
const getTipoTransaccion = async(url) => {
    const { data } = await axios.get(url)
    const transactionArray = data.split('\n')
    const transactions = transactionArray
        .map(e => e.split(',').map(e => e.replace(/\d/g, '').trim()))
        .filter(e => e[1] !== undefined)
        .map(e => e[1])
    const tipoUnicos = [...new Set(transactions)]
    return tipoUnicos
}

/*
Función principal que se encarga de llamar a las funciones anteriores y retornar los datos
 */
const main = async() => {
    const categorias = await getTipoTransaccion(url)
    categorias.forEach(async(element) => {
        const data = await getData(url, element)
        console.log(`------------------${element}------------------`);
        console.log('\n');
        console.log('----------------- HABER -----------------');
        console.log(`Suma total de ${element}: ${getSumaTotal(data, 'haber')}`);
        console.log(`El promedio de ${element} es ${getPromedio(data, 'haber')}`)
        console.log(`El máximo de ${element} es ${getMaxMin(data, 'max', 'haber')}`)
        console.log(`El mínimo de ${element} es ${getMaxMin(data, 'min', 'haber')}`)
        console.log('\n');
        console.log('----------------- DEBER -----------------');
        console.log('\n');
        console.log(`Suma total de ${element}: ${getSumaTotal(data, 'deber')}`);
        console.log(`El promedio de ${element} es ${getPromedio(data, 'deber')}`)
        console.log(`El máximo de ${element} es ${getMaxMin(data, 'max', 'deber')}`)
        console.log(`El mínimo de ${element} es ${getMaxMin(data, 'min', 'deber')}`)
        console.log('\n');
    })
}

main();