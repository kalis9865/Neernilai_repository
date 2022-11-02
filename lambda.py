import boto3

client = boto3.client('lambda')

response = client.invoke(
		FunctionName='AccessEc2',
		InvocationType='RequestResponse'
		)
print(response)
print(response["Payload"].read())
