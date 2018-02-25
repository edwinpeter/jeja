install.packages('httr')
install.packages('openssl')
install.packages('dplyr')
install.packages('jsonlite')

library(httr)
library(openssl)
library(dplyr)
library(jsonlite)

consumer.key <- "CiPfEasOXpRLDY7q7FoAqyr3jqIa"
consumer.secret <- "EZN8h5bHn264yDq7mLzDjIAAsGEa"
key.secret.b64 <- base64_encode(paste(consumer.key, consumer.secret, sep = ":"))
token.response <- POST("https://apistore.datasparkanalytics.com/token", 
                       body = "grant_type=client_credentials", 
                       add_headers(Authorization = paste("Basic", key.secret.b64))) 
token <- content(token.response)$access_token



# Read Subzones
subzones <- read.csv("/Users/Edwin/Desktop/z/subzonemapping.csv")

# Date for query
input.date = "2018-01-28"

# Input filters
filter1 = list(type="selector", dimension="purpose", value="HO")
filter2 = list(type="selector", dimension="purpose", value="WO")

# Loop through each subzone as an origin
subzones.data1 <- as.array(subzones[1:50,1])
subzones.data2 <- as.array(subzones[76:150,1])
subzones.data3 <- as.array(subzones[151:225,1])
subzones.data4 <- as.array(subzones[226:300,1])
subzones.data5 <- as.array(subzones[301:323,1])

df <- data.frame()
for (i in subzones.data1){
  print(i)
  input.locationID = i
  query.body <- list(
    date = input.date,
    timeSeriesReference="destination",
    location = list(locationType="locationHierarchyLevel", levelType="destination_subzone", id=input.locationID),
    #dimensionFacets = list("origin_subzone"),
    #filter = list(type="and", fields=list(filter1,filter2)),
    dimensionFacets = list("origin_subzone", "purpose"),
    queryGranularity = list(type="period", period="PT4H"),
    aggregations = list(list(metric="unique_agents",type="hyperUnique"), list(metric="total_records", type="longSum"))
  )
  query.response <- POST("https://apistore.datasparkanalytics.com:443/odmatrix/v3/query",
                         add_headers(Authorization = paste("Bearer", token)),
                         encode = "json",
                         body = query.body,
                         verbose()
  )
  origin.destination <- content(query.response)
  origin.destination <- content(query.response, as="text")
  
  stop_for_status(query.response)
  cat(content(query.response, as = "text"), "\n")
  
  #convert query response to JSON
  
  data <- fromJSON(rawToChar(query.response$content))
  data.others <- do.call(what = "cbind", args = lapply(data, as.data.frame))
  names(data.others)[1] = names(data[1])
  data.others <- data.others[c(1,2,5,3,4)]
  df <- rbind(df,data.others)
}


df5 <- df



fullfile1 <- rbind(df1, df2)
fullfile2 <- rbind(df3,df4)
fullfile3 <- rbind(fullfile2, df5)
fullfile <- rbind(fullfile1, fullfile3)

fullfile$hour <- as.numeric(substr(fullfile[,1], 12, 13))

fullfile <- subset(fullfile, hour >= 8)
fullfile$timebucket[fullfile$hour <= 12 & fullfile$hour >=8] = 1
fullfile$timebucket[fullfile$hour <= 14 & fullfile$hour >12] = 2
fullfile$timebucket[fullfile$hour <= 18 & fullfile$hour >14] = 3
fullfile$timebucket[fullfile$hour <= 21 & fullfile$hour >18] = 4
fullfile$timebucket[fullfile$hour > 21] = 5

agg <- aggregate(event.longSum_total_records ~ event.destination_subzone + event.origin_subzone + timebucket, fullfile, sum)


fullfilenew <- subset(fullfile, event.longSum_total_records>40)

write.csv(fullfilenew, "sankeydata.csv")


agg <- aggregate(event.longSum_total_records ~ event.destination_subzone + hour, fullfile, sum)





write.csv(agg, "aggregatedheat.csv")





############# IGNORE HERE #############################
input.date = "2018-01-30"

input.locationID = "BDSZ02"

filter1 = list(type="selector",dimension="agent_gender", value="M")
filter2 = list(type="selector",dimension="agent_race", value="CHINESE")
filter3 = list(type="selector",dimension="destination_subzone", value="DTSZ09")

query.body <- list(
  date = input.date,
  timeSeriesReference="origin",
  location = list(locationType="locationHierarchyLevel", levelType="origin_subzone", id=input.locationID),
  dimensionFacets = list("destination_subzone"),
  filter = list(type="and", fields=list(filter1,filter2,filter3)),
  aggregations = list(list(metric="unique_agents",type="hyperUnique"), list(metric="total_records", type="longSum"))
)


query.response <- POST("https://apistore.datasparkanalytics.com:443/odmatrix/v3/query",
                       add_headers(Authorization = paste("Bearer", token)),
                       encode = "json",
                       body = query.body,
                       verbose()
)

origin.destination <- content(query.response)
origin.destination <- content(query.response, as="text")

stop_for_status(query.response)
cat(content(query.response, as = "text"), "\n")

#convert query response to JSON

data <- fromJSON(rawToChar(query.response$content))
data.df2 <- do.call(what = "cbind", args = lapply(data, as.data.frame))
names(data.df2)[1] = names(data[1])

df <- data.frame()
df <- rbind(data.df,data.df2)
df <- df[c(1,5,2,3,4)]

#write csv to working directory

write.csv(data.df, file = "API-output.csv")
