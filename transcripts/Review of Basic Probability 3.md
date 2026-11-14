Chapter 1: Introduction and review
Hello guys, uh welcome to this uh section of uh tutorials in which we will
be continuing our discussion on reviewing the basic ideas of probability.
I again want to start with emphasizing that these discussions that are there
are not what do you call uh a full-fledged discussion on pro. This is just a review of things.
I'm again assuming that the viewers of this course are very much comfortable
and they have taken one at least one rigorous course on probability and then one course on basics of uh machine
learning and then they have come to this uh uh course on generative model. That is our uh preconceived assumption.
Now for the sake of completeness and for the sake of uh reinforcement we are going ahead with this uh batch of
uh tutorials in which our aim is to go ahead and uh discuss the basics of probability.
Now in our previous uh sections of tutorials we discussed from the very basics the idea of probability triplet
probability space. So we looked at uh uh conditional probability, B rule, total of probability, the idea of partitions.
We looked at random variable different kinds of random variables where in which we looked at two important uh things
which is uh discrete random variable and then the continuous random variables. We looked at the
cumulative distribution function or distribution function as uh we call it.
And then for discrete random variable we we looked at the mass function and then for the continuous random variable we
looked at the density function and then uh we looked at uh expectations. So we looked at uh variance and other things.
We looked at a couple of examples of these kinds of random discrete random variable and then the continuous random variable. So we looked at the functions
of random variable. We we looked at the law of the unconscious statistician. So these are the things that we have looked
at in our uh previous discussion. In addition we looked at couple of inequalities. Chbishev inequality, marco inequality, Jensen's inequality and
other things is what we looked at in our previous discussion. [clears throat] So we will continue from there. In today's discussion we will be mainly
concentrating on a pair of random variable. Okay. So and then we will extend it to multiple random variables.
Okay. So this is where uh uh this is what will be the content of the current tutorials. Okay. Without any further delay let's jump into the content.
Chapter 2: Joint distribution functions
o now let me define a pair of random variable.
So let XY be a random variable on the same probability space. I I want to emphasize this on the same probability
space omega FP which is there and each XY maps omega to R. So each one
of them individually is a random variable. We can think of pair of random variable as a vector valued function
that maps omega to R2. we are considering a pair of them. So you can consider that we are mapping from the sample space to R2.
Now this is the definition. Now how do we define uh the distribution function the joint distribution function as it is called as. So this is the notation that we use. It is a function from R2 to R.
Okay. So the joint distribution function of XY. Now how do we define it? For any given values X and Y, it is probability
that X takes the value less than the considered value X and then Y takes the value less than Y less than considered
value Y and which can be written as intersection of uh these two events in a detailed manner like this.
So the joint distribution function is a probability of intersection of the events X less than X and Y less than Y.
Okay. So when I say X that will be the the random variable and this is the uh argument that we are considering and the same thing has been uh written here in a much more detailed manner.
So now let's take a consideration know where in which I have uh x1 and x2. So
wherein which x1 is less than x2 and y1 is less than y2 under this con
consideration. Now how will be the the probability of the random variable taking the values between x1 and x2 and
the y random variable taking the probability between y1 and y2 and what is its intersection is what is being
looked at here. Okay. So now now when we expand this now this is uh the joint
distribution at the points x2 and y2 minus the joint distribution at x2 and y1 minus the joint distribution x1 and
y2 plus the joint distribution at x1 and y1. Okay. Now this will be very much easy to see uh in the next diagram. To
understand intuitively let's say that we have the region of interest. Okay. So which is uh the intersection of these two. So we have I1 and I2 belongs to R.
So now in that case the interval now will be in uh R2. So now this is what is known as a cylindrical set. And uh we
obtain this is the region of interest in which we want to look into the the probability and then uh I assume that
the viewers of this video are uh capable enough to understand this from the
cylindrical set example that has been given.
Okay. So now unlike uh uh the distribution function even the joint distribution function that we have defined by taking a pair of random
variable also needs to satisfy certain properties.
Okay. Now the joint distribution function which is there it's a function mapping from R2 to R and this is how we have defined it. Now this is a valid
probability measure. Okay. Unlike the cumulative distribution function this is also a valid probability. The joint distribution is also a valid probability
measure. Okay, it has to satisfy these properties. Now you in any one of the argument if you consider minus infinity.
So it has to be zero. So for all x and y considered and then in both the arguments if you consider infinity that
means the the whole R2 is what has been considered in this particular case. Now then it has to be one which makes a
standard improvement or the standard extension of the cumulative distribution function that we have seen. and then
like uh uh CDF of a single random variable. Now here also the joint distribution is non-dereasing in each of
its argument exactly analogous to what we saw earlier. And then this also the joint distribution is right continuous
and has left hand limits in each of its argument. Okay there earlier we considered a scalar valued random variable. So here since we are
considering two arguments now it has to be in both of both of those arguments it has to be right continuous and should have left hand limits.
So if you have x1 less than x2 and y1 less than y2. Now this is uh the
what do you call uh the probability of that intersection of that cylindrical set that we get. Now this has to be greater than zero which is analous which
8:008 minutesis just an extension of what we saw earlier. Okay. And uh similar to that
any function which is from R2 to R is satisfying above properties that we discussed now has to be a joint
distribution function for a pair of random variable. Okay.
Chapter 3: Discrete joint PMF
So now let's take the example of a discrete two discrete random variable.
Let X and Y be two discrete random variables defined over the same probability space. [clears throat]
X takes this X1 till Xn and Y takes the value Y1 till YM. So there is no need
that N and M should be same. Okay. So we define the joint PMF. Okay. This is a discrete random variable. So we are uh
we can uh define probability mass function since two of the random variables are involved. Now we are going
ahead and calling it as joint PMF of X and Y. Now this is the mass at those individual points considered. Okay. Now
it is the probability at x is equal to x taking the value x i and y taking the value yj.
Okay. Now for this is valid for all the values that x and y are considering. If
you consider any other value any other values of x and y now then the joint mass will be zero. You don't have any probability mass over there.
So and then analous to the mass function that we saw for a single random variable. Now here also the mass for has
to be greater than zero for all valid x and y that is there for all x and y it has to be greater than it will be equal to zero for all
other non-defined x and y. So yeah and then if you take the sum over all of them no it has to be one. Okay. Now this
is as I told you this is a straightforward extension of PMS PM PMF of uh the single discrete random
variable and then like what we saw from the PMF. So we can get the distribution function. Similarly from the joint PMF
you can get the the joint distribution function. So you summit over all the
values of X that are less than the considered value of X. So for example, now if you're interested in let's say
that X is five. Now you consider all the valid values that the random variable X can take which is less than or equal to five and similarly you do it for Y and take a sum over their mass.
Okay.
So now like this we can compute the probability that is involving two random variables.
A simple example to go ahead with that.
Consider random experiment of rolling two dice. Okay. Now whenever you roll two dice now what are the outcomes that you can get?
Your sample space will have tpples w1 and w2 where each w1 and w2 can take values 1 to six. Okay.
Now on this sample space now let me define two random variables. Now x be the maximum of two numbers that you get
maximum of this w1 and w2 and y be the sum of those two numbers which are there. Now it's a a straightforward
extension that max know which [clears throat] is there that is the what are the valid values that the random variable x can take it
can take 1 to six. It is max of them and then y can take 2 to 12. Now these are the valid values that we can take. And
then how do we define any event x taking the value m and y taking the value n.
Now what do you mean by that? Now we want those uh outcomes of the random
experiment. Now where in which the max should be equal to m and then the sum should be equal to n.
Okay. Now in these two what are the possible uh outcomes that are there? Now these are the only two possible uh
things. Now one is m and n minus m n minus m and m. Now these will for any
considered m and n these are the only two options that are available. So when you consider n=
2 m now then there will be only one outcome that is possible. Okay. So now what will be the probability?
Now if you consider n to be not equal to 2m now then you have two outcomes. If you consider n
equal to 2m so then you have one outcome which is there.
So you can uh compute the probabilities now using these.
Okay. So what will be the mass now for the condition uh m and n which adheres to this particular condition.
It will be the mass will be 2 over 36.
If n is equal to 2m now then the mass will be 1 / 36. Okay. And it is easy to go ahead and check for all the valid values of m and n if you sum it over.
Now will it be one? Now because uh it has to satisfy the condition. Now each of them is uh greater than or equal to
zero. Now that is by this definition it is taken into consideration. But there is another condition which is when you
take over all the valid values it has to sum to one. Now that also needs to be looked into. I leave it as a small exercise for you to go ahead and do it.
Chapter 4: Continuous joint PDF
Now let's proceed and then u consider a continuous random variables. So in which
case we should be defining the joint density function. Let x and y be two uh continuous random variables with the
cumulative distribution function defined as pxy.
Now when will be this cumulative function defined? If there exist this function small pxy that satisfies this
condition exactly analous to the definition of uh the the density function that we saw when we took a single uh uh continuous random variable.
Okay. So now whenever this is satisfied now at that case we say this small p of xy which is there now this is what is
called as a joint uh density function or joint probability density function is what it will be said okay and then it
has to satisfy a similar condition you integrate over uh the whole minus infinity to infinity in both the
variables. So it has to be one. And then at each uh point for all xy now the
density the joint density which is there should be greater than or equal to zero.
And any function that satisfied these two uh conditions is a joint density.
Okay. And this is an extension exactly a similar extension of single valued rand single uh continuous random variable continuous random variable that we took.
Okay. So now let's take a very simple example. Now consider a function f of xy now which is equal to two. So where in
which so 0 less than x less than y and less than one and in every other values
it takes the value zero. So now it can be immediately verified that
uh the first condition which is that uh the values that this density function should take should be greater than or
 condition is now integrate from x minus infinity to infinity y minus infinity to
 property is satisfied or not.
Now now integrating from minus infinity to infinity. Now wherein which the only valid value it takes is in this interval
in every other place it is zero. So rather than integrating minus infinity to infinity I can only integrate it in the valid range. Okay. Now what is the
range of uh y? y takes value between 0 and 1 and x takes value between 0 and y.
So therefore you can integrate y from 0 to 1, x from 0 to y. You integrate this value. I'm assuming that the viewers of
this uh uh video knows uh how to at least do this integration. So it will yield us one. Okay. And the same can be
looked in uh via this diagram. And I just want to reemphasize that this is not the plot of density. Okay. So, so
now this is a straightforward uh these two conditions needs to be taken into consideration only then we say that the
given function is a uh joint density function pertaining to some pair of random variables.
Okay. So just a uh recap of the same. So the
joint uh distribution function is integrating from minus infinity to y minus infinity to x. You take this joint
density function and then you go ahead and integrate. Now if you want to know the what is the probability in a range
that x and y is taking. So you can integrate over that range and then you can get it. Okay. So now let's compute
another uh probability. Let's take this example. Now let's consider the previous example where in which we have already shown that it's a density. So I can
write it as a density. Now suppose we want the probability of y taking the value greater than x + 0.5.
Okay. If this is the case, what is the probability of y taking the value greater than x + 0.5. Now then now this
is a interested event. Now those x and y are what is interested where in which
so we want such x y such that y the value of y is greater than x + 0.5. So
now in that case uh y taking the value 0.5 to 1 and x taking the value 0 to
uh y minus 0.5 from this uh range I think if this is the condition so all of you agree to this this will be the range
in which we should be integrating now we go ahead and integrate we get uh the probability of the specific event is
0.25 2 now which is this is the region of interest.
Okay. So like this we can obtain the probability of any interval that we want using uh the defined uh density joint
density. Okay. So now once we have this uh joint uh density we can obtain the
Chapter 5: Marginal distributions
marginalss. Okay. See the uh idea of marginalss are uh interesting. So let's
go ahead with that. So let x and y be the random variables with the joint distribution function given by this pxy.
And then we already know this. This is how the joint uh distribution function is uh defined. See what do we do? We take infinity at one of the variables.
So then what will happen?
This is probability of x less than x y less than or equal to infinity. So that means that all the valid values of X are
considered. Now this is nothing but now the distribution function for the random
variable X. So what do we do? You just consider all the valid values of Y at a
given X. So that will give us the the marginalss the marginal distributions we can get it. And similarly it can be extended even for Y.
Okay. Now these are marginal distributions or you can just say that these are distributions of x and y. So
these are obtained so by using the joint distribution from the joint we got the marginalss. Okay. Now similarly we can obtain the marginal mass functions.
See you can just call them mass functions. So since we are obtaining it from the join mass function. I'm prefer
just to indicate that uh these are the mass functions that are obtained from the joints. So I'm preferring to go
ahead with marginal mass function. So let's these are the valid values that X can take and let these are the values uh
the Y can take. Now then how do we define this uh joint PMF? So uh so let pxy be the joint pmf in that case.
Now how do we get the mass at a given x?
So this is this is nothing but px of x i right. How do we get it? Now you summit
over all the values of y. Okay you keep x at that specific point and then you summit over all the values of y. Okay.
Now that is when we go ahead and obtain the marginal mass. Okay. Now this by
definition this is the joint mass. So you take the joint mass function and sum it over all the values of y because you want the marginal with respect to x.
Okay that is what you get. And similarly this can be extended for the y also. And
in exactly analogous to this we can have marginal density also let XY be the
continuous random variables over the same sample space I'm just assuming that that is taken into consideration so I'm not going ahead with that now with joint
density now given by this pxy now then this is how the joint distribution is
defined now if you want to go ahead and obtain a distribution for the marginal
distribution at x for x. Now how do we do it? Now we integrate it over y. So
you integrate it for all the valid values of y. Now because of which so
when you take this and integrate now we get px of uh x. So and this is what we
call it as the marginal dens this is the marginal density of x. Okay. And uh similarly it can be extended for y also.
Okay. See now the idea why it is called as marginal.
See earlier people used to maintain let x this is the column of x and this is the column of y. You have all these entries you used to have in the margins
you have to summit over. No, now that is for a specific value of Y, you take all
the valid X's for that. Okay, you put it in the margin. So therefore these are called as marginalss. Okay. Now here you
fix an X and then you vary about Y, you get this. Okay, that is why this is called as marginals. Nice uh way of
putting it. Okay. So now let's try to take the earlier example of rolling two dice and obtain these marginals. So
rolling two dice where x is the max and y is the sum and then this is the joint mass that we
24:0024 minuteshave already defined. Now then we know that how do you get the marginal mass?
You this is with respect to x. So you summit over all the values of y. So take the joint mass which is there and summit over all the valid values of y. Okay.
Now then uh you do it. So you get I I'll leave the uh so what are the valid values that we can take? So n is equal
to m + 1 till 2m is the valid values that you can take. You sum it over and this will be the marginal mass that you
get. And similarly we take the joint density and then calculate uh the marginal density. So this is the joint
density that we have for our earlier example. Now you take this and integrate it over uh y. Now what are the values of
y valid values of y it can take you have already fixed for some x. So from that x till one you take two because of which
this will be the density at given x and x can vary between 0 and 1. Now you have
to verify that this is a density. Now again you take this integrated over all the valid values of x and then you should get one. In a similar manner you
can obtain the density the marginal density for y.
Okay. So now if we are given uh joint distribution function or joint mass
function or joint density function which are there of x and y from there we can
obtain the individual uh distribution functions or mass function or density function. So we can uniquely obtain them. So these are uniquely determined.
Now however the other way is not true.
Now that means that you give individual uh density [clears throat] functions or mass function or distribution function.
We cannot obtain the joint uh of that.
26:0026 minutesOkay. If you have given joint if you are given individual densities how to get the joint density that is not uniquely defined. There can be many different
joint density functions. Now with all having the same marginalss. Okay, this is possible. So given a a joint density
or joint distribution or joint mass from there you can uniquely determine the individual uh things but the converse is
not true. Okay. Now this is regarding the marginalss. Now let's proceed into another important thing which is known as the conditional distributions. Okay.
Chapter 6: Conditional distributions
Now let XV sorry X and Y be the random variables which are defined on the same probability space.
We define the conditional distribution function of X given Y. Okay. Now earlier we did the conditioning of uh events.
Now we are going ahead and uh uh conditioning on occurrence of the a random variable taking a specific value.
Okay. Now we define this conditional distribution P of X given Y like the probability
that X taking the value less than X for the fixed value Y taking a specific
value. Okay. And this is only defined when uh this P Y which is there. See it depends when both of them are continuous
random variables. You have to define this as uh the density if it is u both of them are discrete this is the mass.
So okay now that is the reason see we can see a lot of analogous things that are happening. Now therefore we use a similar notation for the mass and then
the density. Okay fine. So only when uh this py the small py only when it is
well defined now then we can go ahead and uh define this conditional distribution. So
I urge you to go back and look at the definition of conditional probability how we defined now if you are conditioning on an event B now then that
event B should have the probability value which is greater than zero. No, otherwise the conditional probability was not defined. Exactly [clears throat] similar. Okay.
So now this conditional distribution which is there it is R2 to R is how is it defined. Okay. And this is just a
notation. Now it is better uh you can write it like this since it is R2 to R.
Now having this slash in between sometimes uh so it is an abuse of notation but uh yeah we have abused
notation so far very comfortably. So we can proceed with that. It will not be an issue. Okay. Now we should even though we are writing with with a bar and we
should be very much aware that uh this is an R2 tor function. The conditional distribution that we are defining is an
R2 tor function. Okay. Now it is the conditional probability of this event X which is there now given that or conditioned on Y has already happened.
Okay. Now we can uh take couple of examples like the rolling of dice. Now x is max and y is sum. Now x is less than or equal to four when y is three. Okay.
When y is three. Now then now what is the probability that x take x takes the value four? What is x is
maximum? So what are the val valid values whenever you throw a die? Now it is 1 to six. Now that means that for sure you get
uh this is satisfied. Okay. Now therefore now it is having the probability one.
Now y is uh uh 9. Now that means that the sum is 9.
Now what are what is the probability that the maximum of it know will be less than four. Okay. Now this will be zero.
This is not a possible event. So therefore we can define the events like this. Okay fine.
So for every value of y this conditional distribution is a distribution function of the random
variable x. Okay. It defines a new distribution for x based on the knowing value of y. Okay. Now I assume that even
from the definition now this was pretty much clear that for a fixed value of y know for knowing some value of y it is a
distribution over x. Now it is exactly similar. Now conditioned in the conditional probability we defined it conditioned on an event has occurred.
Now how do you readjust the probability exactly analogous to this and you can extend this into conditional mass conditional density so on and so forth.
The conditional mass function we define the conditional mass function of X now given Y. Now which is
represented like this. Now you take the joint this is this is joint mass since uh both of them will be discrete the
joint mass divided by the mass of Y at that given at that considered value of
Y. Okay. This is probability that x taking the value x i for a given yi. And
then uh we can note that if you sum over all the values of uh
uh i. Okay. So you please look at it. If you fix a y and summit over all the valid value of x, no, you will get one.
And this has to hold for all y's. Okay. So let me say that I fix y to be three. So then what are the valid values of x?
Let's say that 1 2 3 something something like that. Now if you sum it over you should get one and then whatever value of y you take that has to be holding.
Now that is what is being described here. Okay. The index is this and this has to be for all y. Now please look at
the indices. Okay. So and then how do you uh from the conditional mass which is there now we can obtain the
conditional distribution. Now you have to summit over all the valid values of for a fixed value of y. Now whatever x
that you have considered now all the x size now that is less than the considered value x you sum it over and then you can get it. Okay. Now a simple
example that we can take is [snorts] of this conditional PMF consider a random experiment of tossing a coin n times.
Okay you have a coin you have tossed it n times. Now x let x be the number of heads and y be the toss number on which
 also was
a tail. The third one is a head now and then you stop at that three. Now number of heads you got is one and the toss
number in which you got the head is three in the considered example. Okay.
So now in that what is that we are asking? We are asking the mass for y given x. So x is one. Now that means
that the we have got uh the number of heads we have got is
one. Okay. And then how many how is this y varying the varying from 1 to n. Okay.
Now what will be the mass at a given k.
Now the k can vary from 1 to n. Now this is y taking a value of k given one.
[clears throat]
you go ahead and uh extend this. Okay.
So now if you have got only one head now that means that out of n tosses if you have got only one head. Now that means that you would have got n minus one
34:0034 minutestails. Now this is this okay and what is the probability of getting one head. Now out of n we know
this this is the binomial.
Now you simplify this you get 1 / n. Now what what does this intuitively mean? If you have got only one head out of n of
them. So now it is equally likely you can get a head in any one of them. Okay.
Now that is what it is being said. What is the toss number where which you got the first head? It is equally likely in any of those n tosses you would have got a head is what is being looked at here.
Okay. So now uh we can uh look at this uh base rule for discrete random
variables. By now we you should have seen this. So the joint mass know which is there can
be written as the conditional mass into the marginal of whatever okay so either it is if you're x given y or you
considering y given x it's it's fine okay so conditional into the corresponding marginal you can take it
okay now therefore you can go ahead and write the base rule like this see I'm not writing uh in this conditional
know x i yj and other things I think I'm assuming that so we are comfortable with those notations so you can easily see
the extension of base rule whenever we are having a pair of random variables now this can be immediately seen okay
and the similar thing let's do it for continuous uh random variable let xy be continuous random variable with the
Chapter 7: Conditioning in communication systems
joint density now defined pxy Now then uh the conditional distribution function is defined as this.
But there is an issue but the conditioning event y is equal to taking y taking the value small y is zero has zero probability.
Now then how do you define it? Okay you have to be writing it in terms of limits. Okay. Now in terms of continuous
when x and y is a continuous random variable now this is an issue whenever when y is a continuous random variable and then you are conditioning on y. Now
y taking a specific value is zero over there and then if you want to define the conditional distribution itself know
then we we define that the conditioning uh uh value should be having a probability greater than zero. But this
particular event is actually having probability zero. Then how do we how do we modify the definition. So we just in introduce this uh the idea of limiting.
So we define in that case if you are conditioning a random variable is a continuous random variable. Now here we have considered x and y both of them are
continuous random variables. Now in that case x taking the value less than x and then y belongs to an interval y to y +
delta and we limit that delta goes to zero. Okay. Now this is uh how uh we
define it. This is a well definfined limit. Okay. So this limit exists for all y where uh this density is taking
the value greater than zero. Okay. And for all x we can define it like this. So therefore by calculating the limit we
can immediately show that this uh the conditional distribution that is there
is an uh integral from minus infinity to x. Now and then the
the joint density divided by the individual marginal which is there and then this is how we this is the
conditional density in that case. Okay, this is how we define the conditional density. the same thing. So here we have defined it as X given Y. Now similarly you can define it for Y given X also.
Okay.
o analogous to this. Now we will continue from the previous example that we had. Now when which the density was
taking the value of two with this interval which we have considered. Now we have uh uh seen the marginal
densities. We have already computed the marginal densities. The marginal density of x is 2 into x - 1 in this interval
and the marginal density of y is 2 y in this specific uh interval. Now we have to define
the conditional density. So now conditional density is the joint density divided by the marginal. So this is uh
joined 2 by 2 y. So you'll get 1 / y in this thing. Okay. Again please remember this. This is r2 to r. Okay.
Okay. I'm assuming that all those are pretty much comfortable by the way in which we are uh defining things. Okay.
Now what is uh whenever we are defining a function now what is its domain and what is its range. So please uh please make a note of them comfortably. Okay.
And similarly you can obtain the marginal density of y given x. We already have this. This is uh 2 / 2 into
1 - x small x. So this is the the marginal density which is there. Yeah.
And from I think these are straightforward extensions. Uh know you can think of conditioned on y is equal
to y x is uniform over 0 y. Okay. And then conditioned on x is equal to some
x. Now this y will be uniform over x to 1. Okay. Now this is a straightforward extension. No, we can look at this and
similarly we can go ahead and get the base rule for continuous random variable. The only thing is please take care of the in the denominator. So
you'll not have a summation you will have an uh integral. So with respect to no depending on whatever you are conditioning okay so x given y you have
this y given x into px this py now py can be written as the conditional into
the marginal. So you're conditioning on x. Therefore you're integrating this with respect to x. Exactly similar
analogous to the uh the discrete case when which if you are going ahead with the discrete you have the summation uh
to get the total probability. Now here you have to integrate. Okay this is essentially the identical to the base rule that we have obtained for discrete
random variable. Okay. So yeah the only thing is wherever you had PDF over there you know here you uh so uh we have put
PDF no where wherever we had PMF now that's the difference that we have done okay good
see till now no in all these pairs of random variable we are considering both of them are of similar nature now what
similar nature in the sense what do I mean by that is now x also is continuous y also is continuous okay now we are not
going ahead with x is continuous, y is discrete uh combinations like that. Now in that case how do we define either we
took earlier both of them are discrete or both of them are continuous. This is how we took it and uh obtained it. But now we are considering one of them is
continuous the other is discrete. Now then how do we go ahead? How do we get the marginalss? How do we get the conditionals and other things is what we
are going to look at. Now the same the same exercise we are going to repeat.
Now here now we are considering x is continuous and y is discrete. Now this is the uh condition that we have. Now
then we define x given y to be a density. Okay. Now y now because it's a function of x is a continuous one in our
current thing. Therefore it's a conditional density. Okay. So then the corresponding uh uh distribution now is probability x taking the value given y.
Then then how will be the density at a given X for a considered X.
Now how will be the density?
So now the conditioning event is Y. You have to take all the Y's together. Okay.
Now this is a conditional density for a given uh uh Y like that. You summit over
all of them. We get this. Okay. where in which each of this x even y is actually a density.
So now y taking a value 1 2 3 with this uh probability. Now then now now what will
be the px what will be the marginal in this case.
Now one now now this is the conditional this is how I have defined the conditional.
 conditional, the probability of obtaining the third one with respect
to the third conditional. Does this ring a bell? This is your GMM, right?
Okay. Now remember how does the GMM used to work?
See, now consider that my data is a combination of four Gaussians.
Now how you how you used to get the density of data at that time. So you used to think of it like I roll a dice okay and then whichever uh
uh I dice has four sides. Let's assume that now whichever face comes I go to that particular gaussian and then I
sample a data from it. Now whenever for a given data point now what is the probability that you get the first Gaussian into the density of the first
 Gaussian into the density of it. So that's that is how we used to do right. Exactly. Look at this. The
44:0044 minutessimilar idea is what we are looking into. Okay. Now you can this is mixture density models and see there is no hard
and fast rule that all of them needs to be Gaussian. Okay. So that is also fine.
One of them having exponential and other things is fine. But please remember they have to be all all the X's has to be all
the forms of X that we are considering has to be continuous. Okay. If that is not the case what happens? So that's totally a different uh thing altogether.
So let's not go in that direction as of now.
Okay. And similarly you know you if you want y given x yeah you have to introduce the limiting factor and go
ahead exactly the similar uh uh notations is what now we have to take.
Okay. This gives us p of y given x into p of x p of x given y into p of y and then now each of p of x given y now has
to be a valid density. Now therefore what you have to do now you have to integrate them and then check that
45:0045 minuteswhether it satisfies uh that when you integrate over the valid range now it has to get to one. Now that needs to be
considered. Okay fine.
So now now we take let's take an example for this. Okay let's take a very simple example to understand uh uh this
specific idea. So now let's take a communication system. Now we are dealing with a communication system.
Now in which that is uh transmitting only two cases. One is either it is transmitting 0 volts or it is transmitting 5 volts. Now whenever it is
transmitting 0 volt the data which is considered to be transmitted is zero and whenever it is transmitting 5 volts so
the bit that it is being transmitted is considered as one. Okay. So now this is what the sender is doing. So now how
does the receiver gets it? Now the voltage measured by the receiver is now whatever the voltage that we get or there might be a loss plus some noise which is because of the channel.
So now let's take X beased voltage by the receiver. Okay. And Y is the sent
bit. Okay. Now I want to know what is the probability y is equal to 1 given x= x. So what do you mean by that? I have
measured some voltage at my receiver end. Now what is the probability that the sent bit was one. Okay. The
probability that sent bit is one when I have measured the voltage of x. Okay.
Now here x is a measured voltage. Now this is a continuous one and y now it can take
either value zero or one. So it is a discrete one. Okay. So now you want to find the probability y= 1 given x= x. So
using the base rule we can get this. But now what do we in practice what do we
want in these cases of situations are see either you can get zero or one.
Okay. Now these are the uh two cases that are there and then you can immediately see that now for a given x
if the probability of uh that bit being one if it is p now the probability of uh
whatever has been sent is zero it is 1 minus p okay now what do we want which in practice we just want probability of
y given x given uh one is the one that we are it has to be greater than zero
that's all. So if you are measuring an old voltage now whatever is greater you go ahead with that is the overall idea
okay now what is that we normally what do we need in these cases we normally just need the ratios okay we don't need
to compute this uh px okay if we get the ratio that is more than enough in this
48:0048 minutescase now let's get the ratio now y given x with y taking the value 1 y given x with y taking the value zero. I expand
this. Now x given y now x given y is actually gaussian.
Okay.
Now uh now that means that if uh now y is one if the sent bit is one. Now what is the voltage that has been sent? The
voltage that I have sent is five. Now therefore you have x - 5 here. Now if the sent bit is zero. If y is zero the
conditioning event is zero. Now then the sent bit is the we have sent zero volts.
Okay. Now we simplify this. Now this will get canceled off. Normally we assume that the probability of getting one and
probability of getting y is equal. Now therefore these two things can be cancelled off. So now this is uh exponential divide by exponential. You
can uh simplify this. Now this will be the outcome. Okay. Now when will this be
greater than one? Now this will be greater than 1 when this 10 x - 25 which is there 10 x is greater than 25. So x is greater than 2.5.
Now what do you mean by this? If the measured voltage which is there is greater than 2.5 then you go ahead and say that it is uh one the bit is one.
Okay. So now if x is if the measured voltage x which is there so if it is greater than 2.5 if you are measuring
greater than 2.5 then we consider that uh the sent bit is actually one okay now
can I get now px yes you can get px so now this is uh one gaussian now this is
this probability is half again another gaussian this probability half so you have to this is the the full px okay
this is a mixture of densities is okay you can simplify this further I'll just uh leave at this point okay
now this is uh regarding marginals conditionals uh pair and joints of uh
the random variables two random variables pair of random variables that were considered now let's consider a very important idea now which is
Chapter 8: Independence of random variables
independence of uh uh two a pair of random variables okay so Now
let's say that we have two random variables X and Y. Now when do we say that they are independent? See the idea is very simple. You take any events.
Okay. If the events are independent then uh uh now what do you mean by events are independent. Now you take the
intersection of the probability of intersection of those events. Now should be the product of individual events. If that is satisfied fine. Okay that is
what is being said here. So this is the intersection the probability of intersection of know the events B1 and B2. Now if you consider them to be the product of individuals then it is fine.
Okay. Now if this is true if X and Y are independent. Now let's take the joint distribution. Now this is how it is
probability of X taking the value less than X. Y taking the value less than Y.
This is one event. This is another event. X and Y are independent.
Therefore, it is probability of X taking the value X, probability of Y taking the value Y. And what are these individually? Individually, these are
the uh marginal uh uh distributions. Okay.
So now it says that if X and Y are independent if and only if the joint can be decomposed into marginals like this.
Okay. Now if there are discrete random variable now, then you can take the joint mass which is there. Now joint
mass will become the product of individual or marginal masses. Okay.
Joint mass is the product of the marginalss. Okay.
Now similarly so let's take the x and y are discrete random variables. This is
how we have uh defined the distribution joint distribution. Now if this is the case so now what will happen? the joint
mass which is there can be decomposed into the product of marginalss. Now then you can uh split this summation into the
valid values of x and the valid values of y. Now we get this is we know this this is the marginalss okay individual
marginalss we get okay yeah so x and y are independent if and only if the joint
mass can be decomposed into the product of uh uh individuals okay and then see I I
want to emphasize here for all the events okay it's not only for one event if you get it No. Okay. Please remember
this. If for all the events it has to be saved. So whatever values of X and Y you take this has to hold. Okay. Only then
53:0053 minutesit makes sense. Okay. Now just you take one corner of one corner combination of events and then if it holds no. Okay.
Please keep that in mind for all.
Okay. And similarly now we can extend it to the continuous random variables. If X and Y are independent continuous random
variable. Now then we can go ahead and uh this uh
joint uh distribution function is the product of marginal distribution. So marginal distribution you can write it
like this. Okay. Now then you can rearrange the terms and then this is what you get. Now then you can think of this as our joint density.
Now joint density is the product of marginalss. Now then this implies that joint density is product of marginalss.
Now this is what will be in case of the continuous random variables. Okay. Now similarly it can be uh seen that if x
and y are independent. So the same thing. So the conditional distribution
will be same as unconditional distribution. Okay. The conditional mass or conditional density which is there is
same as the unconditional mass or unconditional density. This is for all x and y both being continuous
discrete and other things. Any combinations that is there now it holds whatever combinations that we have seen it holds. Okay. So now let let's extend
this into more than two random variables. Okay. So everything we have done so far can be easily extended for
Chapter 9: Multiple random variables
multiple random variables. Now let's say that you have X, Y and Z. Now be the random variable on the same probability space. Now we define joint distribution
function like this. X taking the value less than X Y taking the value less than Y, Z taking the value less than Z. Okay. If all three are discrete random variables.
Now we can define the joint mass like probability of intersection of these three events. X taking the value X, Y taking the value small Y, Z taking the
value small Z. If all of them are continuous, so you integrate them from minus infinity to Z in all the three
variables and then this is the joint density that has been defined and all the conditions that is so if it is joint
mass. So at all x, y and z it has to be greater than or equal to zero. And then if you summit over all the valid values
it has to be one. And the same thing for the joint density for all the valid
values not for for all the values it has to be greater than or equal to zero and then if you integrate it from minus infinity to infinity you have to get
one. This is a straightforward uh extension. Okay. So now in this case we get multiple marginals. You can uh get
the marginalss like from XYZ you can get XY you can get only Z you can get YZ all
the combinations you can go ahead and do okay so now if you have now this is the joint
distribution on Z we are having till infinity so therefore this will become the again a joint with respect to XY okay
now please uh differentiate so now the marginal Now itself can be a joint of two different random variables that we have. And similarly if you take uh uh
till infinity now on the arguments X and Y. Now this will become the marginal Z.
Okay. So on and so forth and and the same thing can be extended with respect to conditionals. You can condition on one event. You can condition on one
random variable. You can condition on multiple random variables. So and similarly you can get B rule so on and so forth. you can just extend it towards
multiple random variables very comfortably.
So now now what happens is
see uh we were taking 1 2 3 so on and so forth like that we can extend to n random variables very comfortably. In
that case it is good and comfortable to consider a vector valued random variables. Okay, easy for writing, easy
for notations and other things. So if you have random variables x1 to xn defined on uh the same probability
space. So now then we denote this vector valued random variable. See I just want to put one more line here to
differentiate that it is a vector. Now this is omega to rn and uh this is how
we define uh the distribution. Okay. Uh so you can call it joint distribution.
So since uh but the notation itself says that this is over n random variables. So we just call it as distribution
functions uh uh so uh I think the viewers can easily understand that it is a vector valued random variable and then
they can extend it. Okay. So then we define the joint mass or joint density
similarly. Okay. So the same notation so we use a similar notation for marginalss conditional distributions so on and so
forth. the same thing whatever we have seen we'll extend it in a similar way. Okay.
So now when some of the random variables that we have considered are continuous and others are discreet. Now we do not have joint PMF or PDF. Now how do we
work with those? Now we will uh look at it at some time. Okay. But
even then if you have a combination of uh continuous and discrete random variables now we don't call them as
joint PDF or joint PMF but we can still define conditional distributions. Now depending on uh the nature of the
conditioning random variable now we can go ahead and define it. Okay. But we can always define conditional distribution function. From there we can get
conditional densities or mass functions easily depending on the conditional random variable which is there and thus
we get the base rule the total everything. Now you can just consider it as an extension. A simple example. Now
let's take that we have this joint density. Now which is taking the value of K in this region. Now then what is
the value of K? Now, now this k now this has to be greater than or equal to zero.
Okay. Now then what is another property?
You integrate it over all the valid uh uh range you have to get one. Therefore you simplify this. This has to go to
one. You have k here. So you can easily get the value of k.
And similarly so you have this uh joint density. You can get any marginals. So if you integrate it over y you get the
joint with respect to xz so on and so forth. Okay this will be the case. Now how do we define the independence of
multiple random variables in that case an extension exact a similar extension which is there. So random variables x1 till xn are set to be independent. If
you consider events for all the events b1 b2 till bn. Okay. Now x i belongs to this bi are independent. Okay.
So now what do we mean by that?
Independence implies that the marginalss would determine the joint distribution.
Again now uh the viewers who are cautious enough now we said that earlier.
Now from the joint we can get the marginals. Okay. But from the marginalss
we can get we should we cannot get joint is what we said earlier. But what are we saying? Independence implies that the marginalss would define joint
distribution. Now why? Because it factors out right now. Therefore we can easily define it. That's the only way of defining it. Now that is an outcome of
the independence. Okay? Now if X and Y are independent. Now then whatever it is joint mass or joint
density is factored as individual mass or individual density depending on the nature.
Now similarly now we can uh define a function of rand multiple random variables.
So now let xy be random variables on uh some probability space. Let g be a
function from r2 to r. Now then we can say that this z which is there is uh
itself a random variable. Okay. Now it is going from r2 to r which is a random variable. Now we can uh if it is
discrete now we can obtain the mass of this z taking the value z. Now what are the valid values? Now this is g of xy
taking the value z. Now what are the valid values of x i and yj. Now because
of which we get uh the considered value z. Now you take all the mass and then
you add them up you get the mass of z taking the value of that specific z. Okay.
So now comes uh a very interesting idea now which is uh iid random variables.
Chapter 10: IID variables and transformations
Okay. Now what is this? iid is independent and identically distributed.
Now this is one of the cornerstones that assumption that we'll be going
ahead in our discussions. IID assumptions is one of the very basic assumptions that we make. Okay. Now to
understand this IID assumptions. Now this was the what do you call a laborious uh background that we just put during this whole of tutorials.
So now suppose uh x and y are independent.
Okay. Now two random variables. What do we mean by that being independent? We know. And then px is equal to py.
Okay. If it is uh uh density or mass. So depending on the nature of x and y we
can go ahead. Now then so they are independent and then they have the same distributional form. Okay.
So now then we call it independent and identically distributed or we just call it iid.
Now similarly we can extend it to n random variables. If I have xn till xn or iid means individually all of them
are independent and then the p x i now I just write it as p which is same for all the random variables that we have considered.
Okay. So now if that is the case, now this is for random variables. Now how will be the
functions of random variables? Okay, independence of functions of random variables. How do we extend this idea?
Now suppose x and y are independent. Now then a function on x g of x and h of y are independent.
Okay. This is a straightforward extension. So now then how they can be generalized.
Now there is a very uh interesting theorem that uh now we have to go ahead now let's do that.
Okay. Now suppose x and y are independent.
Now then a function of x g of x and h of y are independent. Now this can be generalized.
Now let's say that I have x1 till xm and yn till yn are independent.
Okay. Now then we define g of x1 till xn is independent
of x of y1 till yn. Okay. These are independent.
Now in that case
[cough and clears throat]
how do we go ahead? So the the thing is you know one can you get the joint density of other is what we are trying
to achieve here. Okay let x1 till xn be continuous random variables with joint
density. This is the joint density which is there. So now we define y1 till yn by
y1 is equal to g of x1 till xn yn y2 so on and so forth we get this. Now therefore you can consider it as a
vector valued random variable. So you have n of them. So we can consider this R n to Rn. Okay. So if you consider this
whole transformation or if you consider one one transformation each of them each GI you take n values it takes r to r.
Okay this is how each one of them is going ahead. Now then here you have got from x to y.
Okay. Now let h which is there be the inverse of y.
Now that means that from y you are [clears throat] getting to x using this h function. Okay. Now similarly you can get x1 by using this h1.
hn is used to get xn.
Okay. So, so the way to write it is you have x here, you have y here. If you
want to go from uh x to y, you use g. If you want to go from y to x, we use h.
Okay.
Now, this is how you can uh visualize this. Fine. So now then for each of them, we can define a partial
derivative. Okay. Now we denote the partial derivative of these functions like u
dx ii by d yi. Now you define this partial derivatives.
Now then we can define what is the jacobian of this. Okay. Now jacobian uh
you can we can define it like this. This is the jacobian of it. So do x1 by d y1 do x1 by dy2 so on and so forth. D x1 by
dy dx2 by dy2 dx2 by dy2 so on till dx2
by dy so so on and so forth you can assume this so this is the the jacobian
okay so we assume that this jacobian j that we have is non zero in the range of
the transformation okay see what are the conditions that we have so one is you have this transformation
and others you have obtained the Jacobian and then the value of this Jacobian which is there is non zero in
the range of the transformation under these conditions. Now what we can do is we can say that the joint density of y1 till yn. Now how do you get it?
you get the absolute value of this jacobian into the joint density of each of the ones.
Now this is the inverse this is h is from y to x right. So you get this is for x1 so on and so forth till xn you
get it like this. Okay. Now this is in compact we represent it like this.
Okay. Now how do you get the joint density of a function of random variables is what is being discussed
here. Now let's to concretize this let's take an example. So let x1 and x2 have
this joint density p of x1 x2. Now y1 is g of x1 x2 y2 is g of x1 x2. So what is
g1 is x1 + x2. [snorts] g2 is x1 - x2.
In that case, how do we define the inverse? So, it can be easily seen that how do you get x1 back from y1 and y2?
So, y1 and y2 plus y1 + y2 divided by 2.
What is x1 + x2 + x1 - x2? So, this x2 x2 x1 therefore by 2. Now, y1 + y 2x2
will give you x1. Now similarly so now you have this from X you can go to Y and
from Y you can go to X. So now what do we have? We have the joint density in this case. Okay. So now how do I get the joint density for Y's is the question.
Okay. Now I think uh with this example whatever I was trying to say is much more concretized is what I feel.
Okay. you have the joint density for uh this x1 and x2. So how do I get this joint density for y1 and y2 is the
question that we have now. Okay fine. So y's are the function of x's. So in that case now you get the jacobian. Now you
compute the partial derivatives and then uh so you get this this is minus0.5. Now then so you take the absolute value of
it. So you get 0.5 into this is the joint density. Now this is x1. Now this is h of y1 y2 should be there. So what is h of y1 y2?
This is y1 + y2x2. So look at this. This is what h1 this is the
h2. So now you can obtain the the joint density of a function of uh
random variables by knowing its the joint density of x1 till xn. Okay. Now,
this is where we conclude uh uh today's uh discussion. See, today's discussion was much more into handling the pairs of
uh random variables. So, we discussed uh the pairs of random variables and then
uh how will be the joints. So, how will be the marginalss, how will be the conditionals. So and then we extended it
from uh two random variables. We extended it to multiple random variables and then we saw how does it uh work. Now
how do how can we work with those things and then we understood the independence and a very interesting idea that is
needed for us is IAD assumption which is independent and identically distributed uh assumption that is there and then we
went ahead and then saw a very interesting theorem application of the theorem we did not go through the proof of the theorem now where in which if you
have x's and then you have a function you have a transformation ation to y and then you have the joint density of x.
Now how do you get the joint density of y is what we saw. So in the next part of this tutorial we'll be going ahead with
expectation of uh multiple uh random variables. Now how do they work and then what are the interesting properties now
that uh arises because of that expectation variance because of which we get what is known as covariance and stuff and then uh we will conclude uh
the the recap on probability with a very interesting thing which is law of large numbers that is what lies ahead of us.
So I hope this uh tutorials was interesting and then I know that this is a huge list of things which we just did
a recap on a tertiary overview of whatever you have already discussed. I hope this reinforced the ideas and then
what conditions should be looked into whenever you are going ahead and uh using these ideas. I hope those things were helpful and then you learned quite a things. Okay, with this we conclude.
Thank you all for staying tuned. We'll meet in the next one. Thank you. Bye.

---

### Joint Distribution Function
* **Definition:** For a pair of random variables on the same probability space, it is the probability that X is less than a given x and Y is less than a given y at once. It maps R² to R.
* **Application/Mechanism:** It must be zero when either argument is minus infinity and one when both are infinity. It is non-decreasing and right continuous with left-hand limits in each argument. The probability of a rectangular region is non-negative. It is built as F(x2,y2) − F(x2,y1) − F(x1,y2) + F(x1,y1).
* **Direct Quote:** "So the joint distribution function is a probability of intersection of the events X less than X and Y less than Y."

### Joint Mass Function
* **Definition:** For two discrete random variables, the probability that X equals a value xᵢ and Y equals a value yⱼ simultaneously. It is zero at all other points.
* **Application/Mechanism:** It must be non-negative everywhere and sum to one. Summing it over all x less than a given x and all y less than a given y gives the joint distribution function.
* **Direct Quote:** "it is the probability at x is equal to x taking the value x i and y taking the value yj."

### Joint Density Function
* **Definition:** For two continuous random variables, a function whose double integral up to (x, y) gives the joint distribution function. It must be non-negative and integrate to one over the whole plane.
* **Application/Mechanism:** Integrating it over a region gives the probability of that region. Any function that meets the two conditions is a valid joint density.
* **Direct Quote:** "And any function that satisfied these two uh conditions is a joint density."

### Marginal Distributions
* **Definition:** The distribution, mass function or density of one variable, obtained from the joint by removing the other variable.
* **Application/Mechanism:** Set the other argument to infinity in the joint distribution function. For discrete variables, sum the joint mass over the other variable. For continuous variables, integrate the joint density over the other variable.
* **Direct Quote:** "you keep x at that specific point and then you summit over all the values of y."

### Joint-Marginal Asymmetry
* **Definition:** The joint determines the marginals uniquely, but the marginals do not determine a unique joint.
* **Application/Mechanism:** Many different joint functions can share the same marginals. Given only individual functions, the joint is therefore not uniquely recoverable.
* **Direct Quote:** "Now however the other way is not true."

### Conditional Distribution Function
* **Definition:** The distribution of X given that Y has taken a specific value. It is defined only when the conditioning value has positive mass or density.
* **Application/Mechanism:** For each fixed y it is a valid distribution function of X. It readjusts the probability of X using the known value of Y, analogous to conditioning on an event.
* **Direct Quote:** "It defines a new distribution for x based on the knowing value of y."

### Conditional Mass Function
* **Definition:** For discrete variables, the joint mass divided by the marginal mass of the conditioning variable.
* **Application/Mechanism:** For any fixed y, summing it over all x values gives one. Summing it over x values up to a given x gives the conditional distribution function.
* **Direct Quote:** "This is probability that x taking the value x i for a given yi."

### Conditional Density via Limits
* **Definition:** The conditional density of continuous variables, defined as the joint density divided by the marginal density of the conditioning variable. It is defined through a limit.
* **Application/Mechanism:** Conditioning on a continuous variable equalling a value is a zero-probability event. So Y is instead restricted to the interval [y, y + δ] and δ is taken to zero. The limit exists wherever the marginal density is positive.
* **Direct Quote:** "But there is an issue but the conditioning event y is equal to taking y taking the value small y is zero has zero probability."

### Bayes Rule for Pairs
* **Definition:** The joint mass or density equals the conditional times the corresponding marginal, in either order.
* **Application/Mechanism:** This lets you write the conditional of X given Y in terms of the conditional of Y given X. For discrete variables the denominator is a sum over the conditioning variable. For continuous variables it is an integral.
* **Direct Quote:** "conditional into the corresponding marginal you can take it"

### Mixture Density Models
* **Definition:** The density of a continuous variable X when X's density depends on a discrete variable Y. It is the sum over Y's values of each conditional density times that value's probability.
* **Application/Mechanism:** First choose a component according to the discrete variable's probabilities, then draw X from that component's density. The components need not be Gaussian, but each must be a continuous density.
* **Direct Quote:** "this is mixture density models"

### Ratio-Based Bit Detection
* **Definition:** A way to decide the sent bit from a measured voltage by comparing the conditional probabilities of the two bits, using only their ratio.
* **Application/Mechanism:** The measured voltage is Gaussian around the sent voltage (0 V for bit 0, 5 V for bit 1). With equal priors, the priors cancel in the ratio. The ratio exceeds one when the measured voltage exceeds 2.5. In that case the bit is declared to be one.
* **Direct Quote:** "Now this will be greater than 1 when this 10 x - 25 which is there 10 x is greater than 25."

### Independence of Variables
* **Definition:** X and Y are independent when the joint distribution factors into the product of the marginals. For discrete variables this means the joint mass factors, and for continuous variables the joint density factors.
* **Application/Mechanism:** The factorization must hold for all values of x and y, not just one combination. Under independence, the conditional mass or density equals the unconditional one.
* **Direct Quote:** "So now it says that if X and Y are independent if and only if the joint can be decomposed into marginals like this."

### Independence Determines Joint
* **Definition:** When variables are independent, their marginals fully determine the joint distribution.
* **Application/Mechanism:** Independence makes the joint factor into the marginals, so the joint is just their product. This is the one case where the marginals do give the joint.
* **Direct Quote:** "Independence implies that the marginalss would determine the joint distribution."

### IID Random Variables
* **Definition:** Random variables that are independent and share the same distribution (the same mass or density).
* **Application/Mechanism:** For n variables, they are mutually independent and each has the same distribution p. The speaker describes this as one of the cornerstone assumptions of the discussions that follow.
* **Direct Quote:** "iid is independent and identically distributed."

### Independence of Functions
* **Definition:** Functions of independent random variables are themselves independent.
* **Application/Mechanism:** If X and Y are independent, g(X) and h(Y) are independent. This generalizes to functions of separate groups of independent variables: g of (X1…Xm) is independent of h of (Y1…Yn).
* **Direct Quote:** "Now suppose x and y are independent. Now then a function on x g of x and h of y are independent."

### Vector-Valued Random Variable
* **Definition:** A collection of n random variables on the same probability space, treated as one mapping from the sample space to Rⁿ.
* **Application/Mechanism:** It simplifies notation when extending joint, marginal and conditional ideas beyond two variables. Joint masses, densities, marginals, conditionals and Bayes rule extend directly. Marginals of a joint can themselves be joints over fewer variables.
* **Direct Quote:** "In that case it is good and comfortable to consider a vector valued random variables."

### Mixed Variable Conditioning
* **Definition:** When some variables are continuous and others discrete, there is no joint mass or density. A conditional distribution function can still always be defined.
* **Application/Mechanism:** The conditional density or mass is obtained from the conditional distribution function, depending on the nature of the conditioning variable. Bayes rule and total probability then follow as extensions.
* **Direct Quote:** "But we can always define conditional distribution function."

### Density Change of Variables
* **Definition:** A method for finding the joint density of transformed variables Y = g(X) from the joint density of X1…Xn. It requires an n-to-n transformation with inverse h and a Jacobian that is non-zero over the range of the transformation.
* **Application/Mechanism:** The joint density of Y is the absolute value of the Jacobian (partial derivatives of each xᵢ with respect to each yⱼ) times the joint density of X evaluated at the inverse h(y).
* **Direct Quote:** "Now how do you get the joint density of a function of random variables is what is being discussed"

---

