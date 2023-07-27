import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
// import { makeChain } from '@/utils/makechain';
import { makeChain } from '../../utils/makechain';
import { pinecone } from '../../utils/pinecone-client';
import { PINECONE_INDEX_NAME } from '../../utils/pinecone.config';

const icMap = new Map();
icMap.set('wangyingce', true);
icMap.set('liukaixing', true);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // setTimeout(() => {
  //   res.status(200).json({text: 'success'});
  // }, 3000);
  // return 
  const { question, history, ic,pdfNameSpace } = req.body;

  console.log('question', question);
  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  //校验ic start*******
  console.log('ic', ic);
  if (!ic) {
    return res.status(400).json({text: 'No IC in the request'});
  }else if(!(icMap.get(ic))){
    return res.status(400).json({text: 'IC check failed'});
  }
  //校验ic end**********

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');
  console.log('=====1')
  // console.log(pinecone)
  try {
    console.log('=====2',PINECONE_INDEX_NAME)
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    console.log('=====3')

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: pdfNameSpace, //namespace comes from your config folder
      },
    );

    console.log('vectorStore');
    // console.log(vectorStore);
    //create chain
    const chain = makeChain(vectorStore,pdfNameSpace);
    console.log({
      question: sanitizedQuestion,
      chat_history: history || [],
    })
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: [] || [],
    });
    // console.log(response);
    // console.log('response', response);
    
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
