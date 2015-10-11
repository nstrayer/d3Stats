//takes a vector and returns the upper and lower bounds of the iqr.
function iqr(vec){
    var n     = vec.length
    var lower = vec[Math.round(n/4)]
    var upper = vec[Math.round(3*n/4)]
    return([lower, upper])
}
