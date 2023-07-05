import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
// import { makeChain } from '@/utils/makechain';
import { makeChain } from '../../utils/makechain';
import { pinecone } from '../../utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '../../utils/pinecone.config';

const icMap = new Map();
icMap.set('wangyingce', true);
icMap.set('liukaixing', true);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log('==============');
  console.log('==============');
  console.log('==============');
  console.log('==============');
  const { question, history, ic } = req.body;

  console.log('question', question);
  // process.env.PINECONE_NAME_SPACE = '';
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

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: process.env.PINECONE_NAME_SPACE, //namespace comes from your config folder
      },
    );

    //create chain
    const chain = makeChain(vectorStore);
    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
