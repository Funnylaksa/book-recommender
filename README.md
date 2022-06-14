# Project Bookworm - Book Recommendation-System

The books dataset is taken from https://github.com/malcolmosh/goodbooks-10k-extended/blob/master/README.md. The dataset contains ten thousand most popular books with over six million ratings.

## Overview
There are 3 inputs in this web app. 
1) User ID
2) Genre
3) Book 

Based on the inputs, a list of recommended books will be generated using different models. The default list is set to a 100 books and can be lower depending on the inputs. 


## Finding similar books (Collaborative Filtering)
The 1st recommender model is created using Collaborative Deep Learning (CDL) training on user ratings. This model uses collaborative filtering, and aims to recommend user books based on what similar users rate highly. On top of ratings data, books description is also fed into the model, providing an additional dimension(text modality) to boost the performance of the recommender.

From the input dataset, user preference data is available in the form of book ratings given by a group of users. Using the preference data, CDL can be used to generate a list of recommended books based on what similar users like. 

When a book input is given, the model can also predict a list of other books which are similar to given book using the latent factors generated from CDL.


## Content Based Filtering
When a genre input is given, the model will return a list of most popular books in the selected genre. Popularity is calculated using the true Bayesian estimate, where a score is given using both the average ratings and rating counts. Even if a rating of a book is high, it might rank lower on this estimate score system if it has low rating counts.


## Cold Start
When no inputs are given, which simulates a cold start problem where no information is available about the new user, the most popular 100 books are returned as a result. From there, the user can select the books or choose a gerne to find books that suits their taste.
 
 
## Multiple inputs
When multiple inputs are fed into the system, recommended list of books are generated for each input. The algorithm will display the books that matches all inputs at the top as "Top Recommendations". Remaining books will be displayed based on each inputs in different sections.


## Future Works
In a real-world scenario, book similarity can be calculated in real time based on users’ input. For personalised recommendation though, CDL will need to be retrained on a routinely basis based on business needs to take in data of new users and new ratings to build up a stronger model.
An additional feature will be needed to collect user preference for the books they have seen, so the new data can be used to update the model. The feature can be a thumbs up, thumbs down button, or a rating out of 5 for more precise scoring.  



### Credits 
Base frontend framework and design inspired by below project. Thank you!
https://github.com/Tharun-tharun/Movie-Recommendation-System-with-Sentiment-Analysis


