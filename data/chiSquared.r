n <- 250
x <- rnorm(n)

y <- x^2
plot(x,y)
plot(rep(0,n), y)


write.csv(data.frame(x = x, y = y), "chiSquaredVals.csv")
getwd()
