def jaccard_similarity(query, document):
    query = query.lower().split(" ")
    document = document.lower().split(" ")
    intersection = set(query).intersection(set(document))
    union = set(query).union(set(document))
    return len(intersection) / len(union)

def return_response(query, corpus):
    similarities = [jaccard_similarity(query, doc) for doc in corpus]
    return corpus[similarities.index(max(similarities))]