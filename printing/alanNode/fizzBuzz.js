
for (i=1; i <= 100; ++i) {

	var div3 = (i%3 === 0),
		div5 = (i%5 === 0);

	if (div3 && div5) {
		console.log('FizzBuzz');
	} else if (div5) {
		console.log('Buzz');
	} else if(div3) {
		console.log('Fizz');
	} else {
		console.log(i);
	}
}