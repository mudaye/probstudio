Chapter 1: Introduction to concepts
Hello guys uh welcome to the next section of uh tutorials on review of probability.
Now in our earlier discussion we looked at the definition of uh probability space and then uh we looked at
conditional probability B rule and then we looked at the idea of independence.
We looked at the idea of random variables different kinds of random variables. We saw discrete random variables, the CDF,
the cumulative distribution function, how is it defined and what are the properties that cumulative distribution function should satisfy. And then we
looked at uh for a discrete random variable, how does uh the PMF the probability mass function is being
defined and what are the properties that the mass function has to satisfy. And then we looked at different uh kinds of
discrete random variable by like barnoli distributions, binomial distribution, geometric distribution, so on and so
forth. And how does the PMF for each of those cases are defined and then for a discrete random variable? Now it is uh
to completely specify the random variable. Now either if we are given the cumulative distribution function or the
mass function it would be uh it it completely specifies the things. Okay.
So now we will continue our discussion with uh the another kind of random variable that we are looking at which is the continuous random variable.
Okay. Now that is what we will do. We will look at the continuous random variables and then a couple of examples of continuous random variables and then
Chapter 2: Continuous random variables
uh we will look at the functions of random variables followed by expectations and variance. Okay, this is what this section of tutorial is
outlined with. Okay, so now without further delay let's proceed.
So now a random variable X is set to be continuous or continuous type. If there
exists a function if there exists a function PX okay uh which is uh this
this is called as the PDF the probability density function which is an R2R function. See and then here I just
want you to understand that this this is the same notation is being used even for PMF the same notation will be used for PDF. Depending on the type of random
variable you should be able to distinguish what is what. Okay. So there exists a function PX which is an R2R
function such that the cumulative distribution function at that point is integral of minus infinity
to X. So whatever x that has been considered into the density the integral of the density function
which is there okay at that point for all x. Now this has to be true for all x. So the pf which is there is what is known as the probability density
function of x. Okay. So now if x is a continuous random variable by definition. Okay this is for all x.
Okay, by definition the distribution function which is there will be continuous at every x. Okay, I think it
which is pretty much clear to see from this definition and the fundamental theorem of calculus
will directly show us that you take uh the derivative of this uh distribution function you get the density function
for all x where wherever this uh the the density is continuous. Okay.
So now continuous random variable takes uncountably many values. Okay. If a RV takes if a random variable takes
uncountably infinite uh many distinct value it is not necessary that it implies that the type of random variable
that we are dealing with is of continuous type. Okay.
So just because a random variable uh we have an RV if if we have a random
variable that takes uncountably infinite many distinct value so does not necessarily imply that this is a continuous type random variable. Okay.
So now the distribution now this is from the right side this is from the left side.
Okay. Now these are same. Now y is continuous at every x. Okay.
Now therefore the px of any given x which is there will be zero for all x.
Okay. And what are the properties that the pdf should satisfy? Now it's an r2r function which is there. It has to
Chapter 3: PDF and CDF definitions
satisfy these things for all x which is there. it has to be greater than zero and then you integrate from minus infinity to infinity you should get one
5:005 minutesand see now here you can see the similarity between the PMF and the PDF which is there see instead of this uh
integral which is integrating over minus infinity to infinity which is there now what you will have you will have summation over all the valid values that
it is taking that also should sum to one okay and then each of the the mass at each of the elements which is defined so
has to be greater than or equal to uh it has to be between 0 and one. Now that specific restriction is not here. Okay,
that is the difference. Okay. Now please uh note those differences.
It has to be just to be greater than zero. It is not uh uh saying that it uh the PDF value should be between 0 and one. Okay. So that is not being said.
That is the reason why we say that the PDF is not a valid probability measure.
On the other hand, the the the CDF and the PMF are actually valid probability
measures. Okay. Fine. Any function that satisfies these two above conditions now
has to be the PDF of some of a continuous random variable. Okay. Now therefore now px satisfying the above
and because of which what will happen in this continuous case [snorts] the cdf of minus infinity will
go to zero of plus infinity will go to one which is straightforward minus infinity to infinity if you put now if it is a valid
pdf now it has to be one therefore the cdf at infinity will be one and px is nondereasing and px is continuous.
See the difference here. Now the standard uh uh definition that we wrote at that time was it has to be right
continuous with left limits. Okay. But now because we are assuming a continuous random variable what happens here is
ince uh all the at all the x it is continuous. So this the px the distribution function becomes
continuous. Okay fine. Now if you want to know the the probability at an in of
an interval okay of an interval a b now then now it will be the cdf at b minus
cdf at a okay so now for a continuous random variable
the probability of all x okay if you take what is the probability at a point x it will be zero please remember that
this is for all Okay. Fine. And then whether you include a point whether so
it's like whether so a less than or equal to x or a is just less than x or
here you don't have the equality in all these cases. See what is the difference between this and this. Now for this you would have added probability x is taking
the value of a. A x taking the value any value is zero. Now therefore these two takes the same value. Now what is the
difference between this and this? Okay, it has one element which is probability X taking the value B which is an
additional thing since it is zero. Now the all these intervals inclusion of equality at any of the interval is same.
Okay fine. So we we normally write it we put the the less than or equal to in all these cases. So it will be the integral
of the PDF in that uh interval AB. Okay.
So this is uh the definition of continuous random variable. Now let's go ahead and look at some of the examples of uh continuous random variables. The
Chapter 4: Common distributions
first one being uh the uniform distribution. Okay. So x is a uniform over an interval a b when the pdf is
defined by this 1 / b minus a for all the x which is between this interval a and b
for any x that is not in this interval a and b it will be zero.
Okay so now from our previous discussion it should be pretty much clear that uniform distribution over open closed
interval is essentially the same. Okay, from our previous discussion, it should be pretty much clear that y is this.
Okay, now this is uh a simple example. I have taken uniform over 01.
So whenever it is uniform 1 / b minus a will be the pdf. What is the value of b?
1 minus 0. Now therefore for all the values between 0 and 1, the pdf will be one.
Okay. Now how will be the CDF?
Now CDF will be X for all the values between 0 and 1. For every X that is less than or equal to zero, it will be
zero. For every X which is greater than one, no it will be one. Therefore you can see that this will be the the CDF
and then this will be the PDF. Okay. Now I have referred here. So
this is very much easy to see it from here. Okay. So the next uh kind of uh distribution that is the exponential
distribution we will sample from each one of them. So in our uh the next what do you call in couple of minutes we'll be getting samples from each of these
distribution. Then we'll be plotting the histograms. Now till then I'll just mathematically define these things uh properly first then I'll go into the uh
coding aspect of the same and how do you sample from those distribution? I'll show it to you using numpy. Okay. All the categorical distri all the discrete
distributions and all the continuous distribution that we'll be seeing we'll be actually working them over the code as well. Okay. So, uh the PDF of exponential distribution is this. Okay.
Uh just rather than reading it uh so this is evident. So x has to be greater than or equal to zero. And then this lambda which is there has the parameter of uh this has to be greater than zero.
Okay. And uh the PDF is equal to Z for all x which is less than or equal to zero. And it is easy for us to verify
that if you integrate this PDF which is there from minus infinity to infinity.
So minus infinity to infinity you can break it into two things 0 to sorry minus infinity to 0 is 1 and then 0 to
infinity and minus infinity to 0. Now this will become uh zero. Why there are no valid values over there? No in the
sense all the values are taking zero okay and 0 to infinity is what you have to consider and then you integrate this
specific uh thing from uh 0 to infinity you get one okay so and then how will be
12:0012 minutesthe cdf looks like now it will be zero for all x which is less than zero and
then the cdf will be 0 to x at this point which is 1 - e ^ of minus lambda x which is that now for exponential
distribution this is the the PDF and then this is the CDF then uh the king of all distributions no
it's not explicitly referred like that I am just telling uh that because we'll be using this most of the time so therefore you can think of this as a king of all
distributions Gaussian distribution or uh known as the normal distribution is uh the PDF is defined by this
one over Sigma into square roo of 2 pi exponential of - x - mu square / 2 sigma
square. Now where in which mu is the mean and then zigma squared is the variance and sigma is the standard
deviation that is there. Okay. And uh the sigma which is there is greater than
zero and the mu is a number. Okay. Okay, we are still considering only the scalar valued random variables. So we will come
to vector valued random variables in some time maybe maybe in next section of the tutorials.
Okay, fine. So we represent this X is from normal mu and zigma square. This is
what is known as the normal distribution. In the case if you take mu is equal to 0 and zigma square is equal to 1. Now this is what is known as the
standard Gaussian or standard normal distribution. Okay, under the conditions that mu is zero and zigma square is 1.
Okay, now these are a couple of examples of uh continuous uh random variables, continuous type random variables. Now
Chapter 5: Functions of random variables
let's look at a very important thing and very interesting thing that is needed for us most of the times is what is known as the functions of random
14:0014 minutesvariables. Okay. So now here let x be a random variable on some probability space omega fp. Now x is from omega to
r. Okay. Now consider a function which is R to R. Let now Y is equal to G of X.
Then Y also maps from omega to real line. So you can see this this is
omega this is X and then you have G which is from R to R. Okay. And then you
define G of X. Now in that case x is mapping from omega to r you use that r
and then you map to another uh r which is there. Okay. Now therefore you can
compositely you can think of y as mapping from omega to r. The standard example that you can uh think of is like
uh for example so
okay uh so uh bit of a lengthy example uh to think so you you go to a so you go
to a hotel and then you are uh you can take one one item so that's the condition in which we are dealing so you
can think of this as the uh what do you uh the billing okay and then
this bill you are paying it from your uh uh what do you call uh from your UPI and then because of which there will be a
change in your uh what do you call money in your account now therefore you can directly think of this as a composite
function now relating your sample space to the reduction in your account okay something like this this is a very
straightforward and a simple example which you can ponder on. Okay.
Now if g is a nice function. Okay I have put in nice. What does that nice mean? I'll
go ahead. Okay. Then y would be a random variable. So now any random variable.
Now you should have cumulative distribution function. How do you do it?
Now cumulative distribution function of this random variable Y for considered for a given Y is probability that Y takes uh the value Y less than or equal
to the considered Y. Okay. So and then what is this capital Y? Capital Y you can consider uh
the capital Y now which is uh nothing but the G of X now which is there. Okay.
Now and then that you can uh immediately
sorry so that you can immediately write that X what are the X's that you're considering
X belongs to all those element Z for which g of Z is less than or equal to Y which is just the reverse mapping that we have seen earlier. Okay.
So now this probability can be obtained from a distribution of X. Okay. In principle we can find the distribution
of Y if we know that of the X. If you know the distribution of X, you can easily find the distribution of Y. An
example here if Y is equal to Ax + B and A is greater than zero. Now this is uh
the definition of CDF. Now Y is Ax + B. Now because of which uh you can write this
whole thing as x less than or equal to y - b by a and if you know the cdf of uh x now you can write directly write this
that means that now we can obtain the cdf of y if we know the cdf of x that is
what is being discussed here okay now now comes uh okay now uh you can
obtain the cdf well and How do you get the PDF? Okay, most of times we'll be working with uh
continuous random variables. Okay, so now this is a very useful theorem as we go along. The name of the theorem is
Chapter 6: Change of variable theorem
change of variable theorem. Okay, now it has certain conditions. Let g be an R2R
function be differentiable with so gdash of X is greater than zero for
all X or G dash of X is less than zero for all X. Either it has to satisfy one of them. Okay, for all X. For some it is
greater than zero, for some it is less than zero. No, for all X that has been considered. Let x be a continuous random variable and let y is equal to g of x
and then then y is a continuous random variable with this as its pdf. Now how
do you define this pdf of y. Now it is you take the pdf of x at this the
inverse value which is there. Okay. And then you take the absolute value of this.
Okay. And what will be the valid values uh for y now which is a and b. What is this a? Now a is minimum of g of
infinity and g of minus infinity and b is maximum of g of infinity or g of minus infinity. Now this is what is known as the change of variable theorem.
Now that means that if you know the PDF of uh x and then you
know the function g now you can if you have y is equal to uh g of x function
which is there. Now you can obtain the pdf of y using the pdf of x and why is it pdf needed? All of us know why.
Okay. This is a very useful theorem.
We'll be using it uh multiple times during our discussion. Okay. I hope you please look at this and then uh please
remember the conditions in which we can use this uh change of variable theorem. Okay.
Chapter 7: Expectation basics
Now let's uh move towards the expectations. Okay. The expectation
of discrete random variable. Let X be a discrete random variable which take these values. Okay. We define the expectation like this scripted E of X.
So you sum over I X I into its mass. Now you can think of it like some kind of a weighted average of each of the thing.
Okay. Now weighted by its mass. Okay.
21:0021 minutesThis is how I define the expectation for a discrete random variable. Now how do you define it for a continuous random variable?
Now extension is pretty much simple. use integral you integrate it over minus
infinity to infinity x into the pdf okay now this is a for continuous random variable therefore the symbol represents
the the pdf of it okay pdf so so sometimes we don't use this brackets we just write ex like this okay and and
please remember that uh this is a scalar in the current case so we have only looking at the scalar valued random variables as of now therefore it's a
scalar Okay, it's a single number you know.
Please please keep that in mind. Okay, and couple of couple of values for binary random variable which is our Bernoli trial which is expectation of X.
It takes value 0 and one 0 into the the pro the mass of at 0 one into the mass
at one. Now this goes off. This is probability of it's taking the value one.
Okay. And the same thing expectation of indicator random variable is the probability of uh uh the event that it
it it wants to indicate. Okay. And similarly you can obtain it for poison random variable geometric binomial uniform exponential and Gaussian
distribution. I have just put it as a uh a list.
Now another important uh uh thing that is needed for us is uh the law of the
unconscious statistician or known as the lotus.
Chapter 8: Law of unconscious statistician
So now how do you take the expectation of a function of a random variable? We know how to take the expectation of a random variable. We know how to do it.
Now how do you go ahead and take the expectation of a function of a random variable is what we are looking into now. Okay. Let x be a random variable
23:0023 minutesand let y is equal to g of x. This is the function. Okay, we have defined the function on random variable already. If x is discrete, okay, the expectation of
y, how do you take the expectation of the function of the random variable? X is a random variable under consideration. Y is the function of the
random variable. How do you compute the uh expectation of the function of the random variable? Okay. So now the sum
over yi into p y of yi. Now what is this yi? Now yi is g of x i and this is px of
x i. So that means that now unconsciously so why it is called as unconscious decision is so not someone is unconscious sleeping. Now
unconsciously you apply you just apply the for each x you unconsciously you just apply the transformation which is there and take the mass as it is. Okay.
That is why it is called as unconscious statistication. Not that he's sleeping and he's unconscious. No, you can apply it unconscious. You should you don't
need to think through it. Okay. See now it might feel like a very simple theorem but the proof goes around three pages for this. Okay. I urge you to look out
for the proof and if x and y are continuous.
Now then an [clears throat] extension you integrate it. So integration minus infinity to infinity. Okay. So this is
gx into the density of it. Okay, this is what is known as the the law of the unconscious statistician or lotus.
Now, some of the very important properties of expectations which we'll be using left, right, center, everywhere wherever you see expectations, we'll be
using this. Now if x is a positive uh uh random variable
that is x takes a value greater than or equal to zero all the x takes the value then expectation of x will be uh greater
than or equal to zero y by straightforward by the definition if x i is only taking uh uh the
uh non- negative values and this is between 0 and one okay x i is taking only non- negative values and this is between 0 and one and you have a
summation this is positive sum of the positive uh things or non- negative things will be positive and similarly
for this similarly for continuous random variable as well okay and then expectation of a constant B is
a constant so expectation of a constant is the constant itself okay now expectation of A into a function of the
random variable is you can take easily a outside and expectation of that function of the random variable. Okay. Now
expectation a x + b. Now you can uh this is a into expectation of x plus b.
An extension of it you have a g1 x plus b g2x expectation of that. Expectation of this plus expectation of this. This
is expectation of a into g of x. You can write of a into expectation of g1 of x plus b into expectation of g2 of x.
Okay. So the linearity of expectations so you can easily look out from here.
Okay. Now these are very important properties to keep in uh what do you call readily in your head. Now we'll be using uh these things also regularly.
Chapter 9: Variance and properties
Now let's look at the variance of the random variable. We define variance of a random variable X as expectation of X minus E X.
So see you can think of it like this.
See X minus E ex is actually the deviation of the values of X from the uh the mean or from the expectation and
then you take the the square of it. You can think of it like see expectation can be thought of as some some kind of an average. So you can think of it like an
average uh deviation in terms of average square deviation. You can think of it like that. Okay. So now uh you can
expand this. So you can expand this square. Now this ex is a constant. Okay, it's a single value. That's why I told you remember that ex is a single value.
So x minus ex you can expand this and then because of linearity of expectations you can take it inside and then you you can solve for this. So
variance of x will be expectation of x square minus expectation of x whole square. See now you have this x² this is
a function of a random variable. Now now you have to use so to compute this expectation of x square. Now how do you know how to compute expectation of x?
But we don't know how to comput expectation of x².
Now x square is a function of x. Now therefore you can use law of the unconscious statistician and compute this expectation. So and then
expectation of x uh you have already computed. Okay. So now see this x minus
ex now is there you take the square of it. Now this will always be a the positive. So you can think of this as
one some random variable y. Now y can only take the values which are non- negative. Now expectation of a non-
negative random variable is non- negative. Okay. Now therefore now that means that this is uh this is always
greater than or equal to 0. The variance of x is always greater than or equal to 0. Therefore it directly implies that expectation of x² is greater than expectation of x whole square from that.
Okay. and some of the important properties of uh variance. Now you have this variance of x plus c.
You add a constant to all the elements of c. Now this is uh variance of x itself. Okay, where c is the constant.
Okay, you have just added the constant the variance uh will not change. If you multiply it, it will be c² into variance of x. Now I urge you to please go ahead
and uh you can solve this. How do you do it? Instead of x you just put x plus c here. Here also x plus c here. And then
29:0029 minutesyou can see that how does that c square gets off. Okay fine. Now here you can see this. Okay. Now this is regarding the variance.
Chapter 10: Probability inequalities
So now we will be looking at some of the important inequalities. See I'll not be going ahead with any of the proofs of
these inequalities. Now these proofs are easily available. I'll not be going into any of the proofs of these inequalities.
I'll be just stating those inequalities.
The first uh inequality that we will be needing is what is known as the marov inequality.
Probability of absolute value of x. Now it is greater than c. Now this is less than or equal to expectation of x to
the^ of k absolute value of the expectation of the absolute value of x to the^ of k divided by c^ of k. You can
uh uh this is this is the marov inequality which is there and then an extension of marco
inequality under certain conditions is chbishv inequality. Now recall the marco inequality and then instead of the
absolute value of x you take the absolute value of x minus expectation of x and k is equal to 2. Now in that case
what will happen? This term will become the variance of x.
Okay. Now it has to be square. But if you take the absolute value this is -2
squared and 2 squared both of them will yield you the same thing. So this and x minus expectation of x will yield us the
same thing. Okay. So this will be variance of x by c².
Okay. Now this is the chbishev inequality under certain conditions that again you consider that expectation to
be mu and variance to be sigma square and c to be k into the standard deviation which is there now then the
chbishv inequality now will turn something like this just substitute them we'll be able to get it
okay and and please look at it here so we are not specifically saying it for any one kind
of random variable. Okay, so this is true for all random variables. So none of this depends on the kind of distribution or the kind of random
variable which is there. Now then the inequality the next inequality that we'll be considering involves uh the
function itself. So which is the Jensen's inequality which we'll be using quite a lot.
So let G be an R2R function and convex in nature. I'm assuming that all of you
are very much comfortable about uh uh now what do you mean by a convex function and what do you mean by a concave function? How does they work?
Else please make a note of it and then uh you need to look at it. Okay. Then
the g of expectation of x is less than expectation of g of x.
Okay. This is what is known as the Jensen's inequality. Now these three inequalities and much more in these
three we'll be using this Jensen's inequality a lot of uh times in our discussions during the uh course. Okay.
So I urge you to look at the proofs of them very simple and interesting proofs.
You can look at them. Okay. Now what we will do now is now this is uh the uh the what do you call this kind of a
completion of theory discussions. So now what we will do is we will look at the implementations of these ideas in the uh collab.
Chapter 11: Simulations and demo
Okay.
Okay. So now let's uh go ahead with the demo of them.
So for this uh we will be uh using the numpy.
Okay. So we'll be using the numpy and then the math plot li is needed. And from the math I'll be using this combination. Why do you need this
combination? Remember binomial distribution to compute the the PMF over there factorials. Now why do you need factorial?
Pi value is needed. Why your uh uh PDF of exponential PDF of uh Gaussian distribution needs a value of pi. Square
root is needed. Square root of 2 pi. Now exp is needed. Log is needed. These are the couple of functionalities that are needed in evaluating uh these values.
Okay. So then uh I'll be going ahead with RNG which is random number generator. I'll be using the default random number generator. Now using the
seed as 42. Now the seed is used for the the the reproducibility. Now you uh fix
with some seed and then reproducibility become much more comfortable. Okay. So now then now whenever we are going ahead with the
precision now we'll be going till four points. Okay. And what is the version of numpy that I'm using? The version of numpy that I'm being currently used here is 2.0.2.
Okay. Yeah, it takes some time to run this.
Okay. Yes. Done. Good.
So now first let's take a very simple uh empirical estimation of the dice
probability. Now the number of trials that I'm considering is this. Okay. Now you can either put a comma or put underscore. It's perfectly fine. Okay.
It is 100,000 is what I'm considering.
The number of roles that I'm considering is that. And how many faces are there in that dice? Now it has 1 to six. You know
y 7 we have written. Okay. So now you can put the shape of this. So you will get a 100,000 [clears throat] length
vector which is there. Now, now here, now let's uh the idea is now I
have obtained these many samples. I have obtained some 100,000 samples. I know theoretically now what will be the probability of each of the event. Now I
have done these so many samples right now with those many samples am I getting somewhere around the similar uh uh
values is what I'm checking here. Now probability of four is NP dot mean or this dice roll wherever it is four that
means that wherever it's it's it's calculating how many times these uh four has occurred and the average is being taken.
Okay. So now and even now it is uh the role dice whenever it is modulus of two
which is an even number it is taking and greater than three the probability which is uh the probability that the
dice the roll of the dice gets the value greater than three. Now these are and uh even and greater than three. So these
are the different probabilities that I'm considering. I hope that you can.
[clears throat]
This is probability that probability of four. This is probability of even this is probability that it is taking the value greater than three. Now that means
that now it is taking the value four, five and six. Okay. What is the probability that it is taking? Okay. So
and then uh it is taking even and uh greater than three. I'm assuming that
you considering that the dice is a fair dice. computing these probabilities will
not be an issue for you guys. Okay, I hope you pause this video at this time.
Compute these values and then we these are these values theoretically from the
known formulas that we have discussed now and then let's compare them with the estimated values that we are getting.
Okay. Now if I run this you can see here probability of four is uh no it has to be 1 / six okay you are
getting 0.669 is what you're getting which is almost similar to here okay now probability that it has to be even see
now it you have only two sets either it has to be even or it has to be odd so it has to be 0.5 so it is 0.499 499 is what
you are getting and then prob theoretical probability that it has to be even you can see it that it is 0.5 which is known to us. So and then the
estimated probability that x is even and x greater than three and uh that is 332.
Now what are the values that x is equal x is greater than 3 and it is even. Now it is probability that it takes either value four or it takes value six. Okay.
So now you can compute you you should have computed these probabilities and then you can compare them with the
obtained estimated values. Okay. So now a simple example to computation of B rule.
Now suppose that the probability of getting a disease is 0.01 is the prevalence of disease and then let uh t
positive denotes the positive test results. Okay. And then we will assume that now the probability of t being positive given d this is /mid is given.
So you kind have to think is 0 95 and then the test is positive given the
disease complement that is this is not existent is 0.05 05 then now what is the probability that D given T positive okay
now how do you compute this is the question probability that D given T+ now you can apply the
B rule okay and then you can compute it so now probability of disease is 0.01 01
the positive uh uh P positive given the disease. This is P positive given no disease. Okay, sum is one. You can see
that. Now how do you compute this is P positive. Now why the P positive has to be in the denominator. Okay. And this is
disease given positive is positive given disease into positive dis divided by the P positive. And this is you can
immediately see that this is using uh the total of probability you have computed this. Okay. And uh it is very
much easy to see that the probability that you have a disease giving it is positive is this value.
Okay. This is just a numerical application of B rule. So I want you to compute this in hand and then compare it. Okay.
Yeah. and then uh so this is uh two random variables. So I'm considering uh rolling of dice as
one. Okay. See rolling of dice is a random experiment. The sample space is 1 to six and the same one is mapped to
one, two is mapped to two. You can think of it as a random variable also. And then that is x and then y is that is
being even or odd. Okay. So now these are the die outcomes. I'm taking
20 outcomes and then I'm taking the indicator random variable. Okay. So whenever it is six, it is one. Six is one. Six is one.
Is this die uh bias die? Can you come to any of those conclusion? Think ponder over it.
Okay. And whenever it is five, it is zero. Now you can think of this as the indicator random variable.
And then uh let's com let's verify that expectation of the indicator random variable is the probability of occurrence of that event. Okay. Now let
me take the number of trials that I'm taking as uh uh 100,000. So
I obtain 0 to 6 for see what do what does this mean? I just roll a dieice for 100,000 times and record those values.
Now what is the uh a that I'm considering? The a that I'm considering is I'm getting greater than or equal to
five. Okay. That means the values that I can get is uh five and six. Okay. So now
how many times is that is the indicator random variable of that? You take the mean of that indicator random variable.
Okay. So and then in the and you obtain the estimated means roles greater than or equal to five. Now this is the estimated expectation. This is the
estimated probability. Okay. I think uh you'll be able to appreciate that we know that expectation of an indicator random variable is the probability of that event. Both of them has to be same.
You can see that both of them are quite close. Okay. This is uh uh easily you can see this. Okay.
So now let let's let's go go to other random variables under consideration.
I'm taking a binomial random variable n is one. So whenever I take a binomial random variable where n is one which is nothing but a bernoli trial. Okay. If
you want to uh what do you call do a Bernoli trial you take a binomial distribution with n is equal to 1 and p is the
uh the probability of the head which is there and then I'm taking 100,000 s that means I am tossing the coin some 100,000
times okay and what is the estimated mean the mean of the all these samples theoretical mean is the p itself we we
know this okay we have and the variance now how do you compute the variance for Bernoli distribution is P into 1 minus
P. Okay, you can compute that. So now you have obtained that and then we run this.
Now estimated mean is 700.6. Theoretical mean is 0 7. Estimated variance is 0.209. Theoretical variance is 0.21.
Okay. Now whenever you have enough number of samples so expectation variance will almost be same as that of
the theoretical values is very much seen and this is the histogram that so you can see that
we are getting 70% of the times we are getting it as the head. Now just reduce
the number of uh trials reduce n to 10, n to 20, n to 30 and try to run the same
code and see will we get similar values or not. Okay, vary the number of uh trials and see the values. Okay. Now
similarly you can always uh this is sampling from a uh a barnoli trials. Okay. Now if you
want from any other categorical distribution you can specify that what are the values. Now here I want to sample cat dog and bird. Cat has to be
sampled with probability of 0.2 dog with 0.5 and bird with 0.3. Okay. Now the random number generator dot choice. Now these are the categories that I want.
And how many times I have to sample? I have to sample it 20,000 times. And then you take the mean of each of them. Now it is seen that.
So your cat is being sampled 96 times dog 496 bird is 30 which is
similar to what is the probability that we have assigned again here also change the number of change the size to a smaller value and go on increasing and
see how these values are converging towards the true probabilities okay and similarly we can take a
binomial distribution so this binomial distribution n I'm taking 10 and probability of success is four and then
uh I'm uh doing it the size is 10,000 times and we can see
this here okay this is number of successes now how many times you had a success here
with one with two so okay you get a graph like this and then estimated mean is the theoretical mean is four in In
this case we get 3.9 estimated variance is 2.38 we get 2.4. Okay.
Uh this is again this is for the binomial distribution. Similar thing I have done it for poison distribution. I since I give the code I'll not go ahead
with that. I have just uh I'll just go ahead with that.
Now let's look at the continuous random variables. We'll be doing the similar kind of an exercise for continuous random variable. First I'm taking a uniform uh distribution in uniform over
minus2 to three. Okay, I'm sampling some 100,000 times. Now here also I'm estimating the mean theoretical mean I
know what it is. Okay, so and then estimate estimate the variance and then theoretically compute the variance. So
and then compare them. So just to see that you can see here estimated mean is 0.5 theoretical mean is similar
estimated variance and then the theoretical variance which is there and this is the histogram of the same okay
and the same thing I'm doing it for uh the normal distribution.
So ring dotn normal. So this is the mu. This is uh the zigma which I'm taking.
I'm sampling some 100,000 times get a grid.
Okay. You can see here mean is two theoretical var variance is uh 2.25 and
then you can see that this is whatever is in the orange line that is the theoretical computation of the density
function. And then this is the histogram and then you see that how is it matching.
So just again here also do the same thing with the same code. So now what you are supposed to do is change this number okay and try to run the same code
and see whether you get a nice overlap like this. Okay nice uh what do you call uh uh superimposition not overlap
superimposition like this. Okay please try it out.
So similarly I have done it for uh exponential distribution. You can see it here the histogram and the PDF uh is
48:0048 minutesbeing uh what do you call nicely superimposed one on top of another.
Okay. And the mean the theoretical variance all of them are mapping matching here. Okay. Now uh I want to
take uh couple of uh samples from the standard normal distribution and computes its CDF. Okay. Till now I have used the PDF. I have just computed PDF.
Now I want to use the the CDF of it.
Okay. Now now it can be seen that okay you'll get the sigmoid function.
Okay. Now both the functions are important for us. Sigmoid function is quite important for us. And then we need uh the the PDF. How am I doing it here?
Okay, empirical CDF. How how am I computing the CDF?
Please uh go ahead and uh you should be able to obtain it uh neatly. Okay.
Fine.
Okay, fine. So, let's proceed.
Huh? Yes. This is what I was uh uh saying.
Now, change the sample sizes. Okay. Do it for 10, 100,000 and 100,000 like this and then see how does the mean variance
will be changed. Now as you can see here now it starts
from this okay minus 0.2 and variance is 1.56. Now our actual value is 0 and one
okay now as you increase the number of samples the mean goes near the actual value and then even similarly the variance.
Okay. So now this is uh till now this is random variables. Now look at the functions of the random variables. Now how do we handle that? Now you sample X
from uh the standard normal distribution and then Y you have and then plot them plot the histogram.
This is the the standard normal and this is the x² of that. Okay, this is the transformation of that. Similarly you
can go ahead and uh look at the linear transformation. This is y is equal to x square is a nonlinear transformation.
Now you can think of it as you can go ahead and do it for the linear transformation and whenever you are doing the linear transformation. Now uh
now one additional thing that I have done here is now we have taken into consideration the computation of
expectation of y and the variance and then the expected and then the uh the estimated.
Okay. So the predicted and the estimated. Now you can see it here. Now they are matching.
Okay. So now a is -4, b is 5. Now if you want to find the expectation of y. Now how do you do it? A into expectation of
x + b. Okay. So now a is what? A a is -4. The mean is 3. -4
uh into 3 is -12 and b is this 5. -12 + 5 it is - 7. Now we get expectation to
be - 7. Okay, around that point you should be able to obtain it. Okay,
fine. Uh, similarly, now we are trying ahead for some discrete values. So, we are taking the
discrete values 1 2 and five with these probabilities and then we are computing the expectation. So, we can see that
they are also matching. Now, similarly, you can do it for uh the expectation of nonlinear functions. Now if you want to find the nonlinear function how you have
to do it now use of lotus. Now as you can see here this is where we have applied the lotus okay law of the
unconscious statistician and we can see that they're matching. See I'm giving these examples just to reinforce the formulas which are there and how to go
ahead with that okay [snorts] and again uh linearity of expectations
what happens uh when you go ahead and use it. I have just shown it with another example. Okay. And this is a uh
very interesting thing that I have uh considered.
So now here x which is there is a normal uh 2 three
mean is at two and uh it is having uh the the scale of three and then I'm
making y is equal to 2x plus some noise that has been added. Okay, some Gaussian noise that I have been added here. Okay,
53:0053 minutesnow Y is dependent on X. Now whenever Y is dependent on X and sometimes whenever
Y is not dependent on X. So X and Y are independent, how will be the expectation
gets modified is the question that I'm trying to ask here. Okay. Now here you can see that. So the expectation is uh
so so so here you can see that x and y are dependent. Now in that case so expectation of xy and expectation of x
into expectation of y. Now you will get them as separate. On the other hand if
you have them to be independent here I have taken x to be a normal 2 3 and y to be minus1
and four. Now then you compute this expectation of XY and expectation of X into expectation of Y they are the same indicating that these are independent.
54:0054 minutesOkay you can derive this formula very comfortably. So I just taken now one is a dependent dependent random variables
the other is independent random variables. How do they work is what I have tried to show here numerically.
Okay. Now you can have this uh variance and standard deviation. So computation of variance. Now how do you
compute it? So variance definition is this x minus mean of this x whole square. You can see this definition here
or alternate way. So it it has to be uh similar and you use the numpy and
compute it. So you should get almost similar values and properties of uh
variance. Okay. [snorts] Now here y that I'm taking is a x + b. I'm computing variance of y. Now what will be the
variance of y. So this is one random variable ax + b. If you take the variance now it will be a² into variance
of x. Now you can uh I urge you to take a piece of paper and derive this. What will be the variance of y in this case?
Now we can see that variance of y and a square into variance of x which is the actual formula both of them is yielding
us the similar numbers. Okay. So now uh the aim of all these uh uh what do you
call simulations what to show you that now how do you perform these kinds of computations using uh the libraries like
uh numpy and others. Okay. Now with this we conclude uh uh this section of tutorials in which uh we looked at uh
the uh continuous random variables. We looked at the the functions of random variables. We looked at the expectation.
We looked at the the variance and other things. So and uh how do you what are the properties of expectations? What are
the properties of variance? So is what uh we have discussed in this section of tutorials. In the next section now what
we'll be going ahead is we'll be taking a pair of random variables. Okay, we'll be taking a pair of random variables and then uh we'll be solving couple of
problems and similarly as we did using numpy we'll be simulating them on the system as well and see how uh
theoretically obtaining the value and then estimating the values with the samples now gives us uh similar kind of
results. Now this is what lies ahead of us and as I told you these are what are known as just refresher uh discussions.
Okay. Now anybody we are assuming that the people who are uh the viewers of this course already know these ideas and
then this is just being repeated or this is just being reinforced. Now that is what uh we actually uh assume from the viewers of this uh uh uh course. Okay.
With this we conclude uh today's discussion. So thank you all so for watching this section of tutorials.
We'll meet in the next section of tutorials. Till then have a nice day. Bye-bye.

---

### Continuous Random Variable
* **Definition:** A random variable X is continuous if there exists a function p_X (the PDF, an R→R function) such that the CDF at every x equals the integral of the PDF from minus infinity to x.
* **Application/Mechanism:** The CDF is then continuous at every x, and differentiating it gives the density wherever the density is continuous. The same notation p_X is used for both PMF and PDF, so the type of random variable tells you which is meant.
* **Direct Quote:** "the cumulative distribution function at that point is integral of minus infinity"

### Uncountable Support Caveat
* **Definition:** Taking uncountably many distinct values does not by itself make a random variable continuous-type.
* **Application/Mechanism:** Having uncountably many values is not sufficient for the continuous definition. The PDF-integral definition has to be satisfied.
* **Direct Quote:** "variable that takes uncountably infinite many distinct value so does not necessarily imply that this is a continuous type random variable."

### Zero Point Probability
* **Definition:** For a continuous random variable, the probability of taking any single value x is zero.
* **Application/Mechanism:** Because of this, including or excluding an interval's endpoint does not change its probability. The probability of an interval [a, b] is the CDF at b minus the CDF at a, which equals the integral of the PDF over the interval. The convention is to write "less than or equal to".
* **Direct Quote:** "Now therefore the px of any given x which is there will be zero for all x."

### PDF Validity Conditions
* **Definition:** A function is a valid PDF if it is greater than zero for all x and integrates to one from minus infinity to infinity.
* **Application/Mechanism:** Any function meeting these two conditions is the PDF of some continuous random variable. Unlike a PMF, its values need not lie between 0 and 1, so the PDF is not a valid probability measure, whereas the CDF and PMF are. The CDF goes to 0 at minus infinity, goes to 1 at plus infinity, and is non-decreasing and continuous.
* **Direct Quote:** "That is the reason why we say that the PDF is not a valid probability measure."

### Uniform Distribution
* **Definition:** X is uniform over an interval [a, b] when its PDF is 1/(b − a) for x in the interval and zero elsewhere.
* **Application/Mechanism:** Open versus closed intervals give essentially the same distribution. For uniform over [0, 1] the PDF is 1 on that interval and the CDF is x for x between 0 and 1, zero below, and one above.
* **Direct Quote:** "defined by this 1 / b minus a for all the x which is between this interval a and b"

### Exponential Distribution
* **Definition:** A distribution with a parameter lambda greater than zero, where the PDF is zero for x below zero and decays exponentially for x greater than or equal to zero.
* **Application/Mechanism:** Integrating the PDF from 0 to infinity gives one, which verifies it is valid. The CDF is zero for x below zero and 1 − e^(−λx) otherwise.
* **Direct Quote:** "then the cdf will be 0 to x at this point which is 1 - e ^ of minus lambda x which is that now for exponential"

### Gaussian Distribution
* **Definition:** A distribution parameterised by mu (the mean) and sigma squared (the variance), with sigma greater than zero. It is written X ~ N(μ, σ²).
* **Application/Mechanism:** Its PDF is (1 / (σ√(2π))) times exp(−(x − μ)² / (2σ²)). With mu equal to 0 and sigma squared equal to 1 it is the standard normal. The speaker calls it the "king of all distributions" because it will be used most often.
* **Direct Quote:** "In the case if you take mu is equal to 0 and zigma square is equal to 1."

### Functions of Random Variables
* **Definition:** If X maps the sample space to the reals and g maps the reals to the reals, then Y = g(X) is also a random variable, mapping the sample space to the reals by composition.
* **Application/Mechanism:** The CDF of Y at y is the probability that X lies in the set of z for which g(z) ≤ y, so the distribution of Y follows from that of X. For Y = aX + b with a > 0, this becomes X ≤ (y − b)/a, so the CDF of Y comes directly from the CDF of X.
* **Direct Quote:** "X belongs to all those element Z for which g of Z is less than or equal to Y which is just the reverse mapping that we have seen earlier."

### Change of Variable Theorem
* **Definition:** If g is differentiable with g′(x) either greater than zero for all x or less than zero for all x, and X is continuous, then Y = g(X) is continuous. Its PDF is the PDF of X evaluated at the inverse value, multiplied by the absolute value of the inverse's derivative.
* **Application/Mechanism:** The valid values of y run from a to b. Here a is the minimum of g(infinity) and g(minus infinity), and b is the maximum of the same two. It lets you obtain the PDF of Y from the PDF of X and the function g.
* **Direct Quote:** "Now you can obtain the pdf of y using the pdf of x"

### Expectation
* **Definition:** The expectation of a discrete random variable is the sum of each value times its mass. For a continuous one it is the integral over minus infinity to infinity of x times the PDF.
* **Application/Mechanism:** It is a weighted average, weighted by mass or density, and is a single scalar number. For a Bernoulli variable it equals the probability of taking the value one.
* **Direct Quote:** "Now you can think of it like some kind of a weighted average of each of the thing."

### Indicator Expectation
* **Definition:** The expectation of an indicator random variable equals the probability of the event it indicates.
* **Application/Mechanism:** In the simulation, rolling a die 100,000 times and taking the mean of the indicator "roll ≥ 5" gives an estimate close to the probability of that event.
* **Direct Quote:** "expectation of the indicator random variable is the probability of occurrence of that event"

### Law of Unconscious Statistician
* **Definition:** The expectation of a function Y = g(X) can be computed directly from the distribution of X, without first finding the distribution of Y.
* **Application/Mechanism:** For discrete X, apply g to each x_i and weight by the mass of x_i. For continuous X, integrate g(x) times the density. The speaker notes the proof is about three pages long.
* **Direct Quote:** "you unconsciously you just apply the transformation which is there and take the mass as it is."

### Linearity of Expectation
* **Definition:** Constants can be pulled out of an expectation, and the expectation of a sum of functions is the sum of their expectations.
* **Application/Mechanism:** E[aX + b] = a·E[X] + b, and E[a·g1(X) + b·g2(X)] = a·E[g1(X)] + b·E[g2(X)]. The expectation of a constant is the constant itself. The expectation of a non-negative random variable is non-negative.
* **Direct Quote:** "Okay. So the linearity of expectations so you can easily look out from here."

### Variance
* **Definition:** Variance is the expectation of (X − E[X])², the average squared deviation from the mean.
* **Application/Mechanism:** Expanding the square and using linearity gives E[X²] − (E[X])², where E[X²] is computed with LOTUS. Variance is always non-negative, so E[X²] ≥ (E[X])². Adding a constant to X leaves the variance unchanged, and scaling X by c multiplies it by c².
* **Direct Quote:** "variance of x will be expectation of x square minus expectation of x whole square."

### Expectation of Products
* **Definition:** For independent random variables, E[XY] equals E[X]·E[Y]. For dependent ones the two differ.
* **Application/Mechanism:** In the numerical demonstration, Y = 2X plus Gaussian noise (dependent on X) gave different values for E[XY] and E[X]·E[Y]. An independently drawn Y gave matching values.
* **Direct Quote:** "they are the same indicating that these are independent."

### Markov Inequality
* **Definition:** The probability that the absolute value of X exceeds c is at most the expectation of |X|^k divided by c^k.
* **Application/Mechanism:** It holds for all random variables and does not depend on the kind of distribution. It is the basis for the Chebyshev inequality.
* **Direct Quote:** "Probability of absolute value of x. Now it is greater than c."

### Chebyshev Inequality
* **Definition:** Applying the Markov inequality to |X − E[X]| with k = 2 bounds the probability of deviating from the mean by the variance of X divided by c².
* **Application/Mechanism:** With E[X] = μ, variance σ², and c = k·σ, it can be restated in terms of standard deviations. It holds for all random variables regardless of distribution.
* **Direct Quote:** "Okay. So this will be variance of x by c²."

### Jensen's Inequality
* **Definition:** For a convex R→R function g, the function of the expectation of X is less than the expectation of the function of X, as the speaker states it.
* **Application/Mechanism:** It relates g(E[X]) to E[g(X)] for convex g. The speaker says it will be used a lot in the course.
* **Direct Quote:** "Then the g of expectation of x is less than expectation of g of x."

### Bayes' Rule Application
* **Definition:** The probability of a disease given a positive test is the probability of a positive test given disease, times the disease probability, divided by the overall probability of a positive test.
* **Application/Mechanism:** The overall probability of a positive test (the denominator) is obtained with the total probability theorem. The example uses prevalence 0.01, P(positive | disease) = 0.95, and P(positive | no disease) = 0.05.
* **Direct Quote:** "disease given positive is positive given disease into positive dis divided by the P positive."

### Empirical Estimation by Sampling
* **Definition:** Theoretical probabilities, means, and variances can be checked by drawing many random samples and computing the corresponding sample statistics.
* **Application/Mechanism:** Using numpy's default random number generator with a fixed seed (42) makes results reproducible. Sample means, variances, and histograms are compared against the theoretical values and PDFs. Increasing the number of samples brings the estimates closer to the theoretical values.
* **Direct Quote:** "as you increase the number of samples the mean goes near the actual value and then even similarly the variance."

---

