# # from langchain_openai import ChatOpenAI
# # from langchain_core.prompts import ChatPromptTemplate
# # from langchain_core.output_parsers import StrOutputParser

# # import os
# # from dotenv import load_dotenv
# # import streamlit as st

# # load_dotenv()
# # os.environ["OPENAI_API_KEY"] =os.getenv("OPENAI_API_KEY")



# # prompt=ChatPromptTemplate.from_messages(
    
# #     [
# #         ("system","your a helpful assistant that will answer the user queries"),
# #         ("user","Question:{question}")
        
# #     ]
# # )

# # st.title("LangChain Chatbot")
# # input_text=st.text_input("provide me the question")


# # llm=ChatOpenAI(model="gpt-4o-mini",temperature=0.5)

# # output_parser=StrOutputParser()
# # chain= prompt |llm|output_parser

# # if input_text:
# #     st.write(chain.invoke({"question":input_text}))

# from langchain_openai import ChatOpenAI
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import StrOutputParser

# from langchain.agents import AgentExecutor, create_openai_functions_agent

# from langchain_community.tools.yahoo_finance_news import YahooFinanceNewsTool
# from langchain_community.utilities.alpha_vantage import AlphaVantageAPIWrapper
# from langchain_community.agent_toolkits.polygon.toolkit import PolygonToolkit
# from langchain_community.utilities.polygon import PolygonAPIWrapper
# from langchain_community.agent_toolkits.financial_datasets.toolkit import FinancialDatasetsToolkit
# from langchain_community.utilities.financial_datasets import FinancialDatasetsAPIWrapper

# import os
# from dotenv import load_dotenv
# import streamlit as st

# load_dotenv()

# # Set keys
# os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
# os.environ["ALPHAVANTAGE_API_KEY"] = os.getenv("ALPHAVANTAGE_API_KEY")
# os.environ["POLYGON_API_KEY"] = os.getenv("POLYGON_API_KEY")
# os.environ["FINANCIAL_DATASETS_API_KEY"] = os.getenv("FINANCIAL_DATASETS_API_KEY")

# st.title("LangChain Finance & ChatBot")

# input_text = st.text_input("Ask me anything (finance/stocks trends or general queries):")

# # Prepare LLM
# llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5)

# # Setup financial tools
# yahoo_news_tool = YahooFinanceNewsTool()
# alpha_vantage = AlphaVantageAPIWrapper()

# polygon_api = PolygonAPIWrapper(polygon_api_key=os.environ["POLYGON_API_KEY"])
# polygon_toolkit = PolygonToolkit.from_polygon_api_wrapper(polygon_api)

# fd_wrapper = FinancialDatasetsAPIWrapper(
#     financial_datasets_api_key=os.environ["FINANCIAL_DATASETS_API_KEY"]
# )
# fd_toolkit = FinancialDatasetsToolkit(api_wrapper=fd_wrapper)

# # Combine tools
# tools = [
#     yahoo_news_tool,
#     *polygon_toolkit.get_tools(),
#     *fd_toolkit.get_tools(),
#     # TODO: Wrap AlphaVantage functions if needed
# ]

# # System prompt
# system_prompt = """
# You are a helpful assistant. Sometimes the user will ask about finance / stocks / trends. 
# When that happens, you have access to tools to fetch latest stock data, news, financial statements. Use them. 
# For general questions, just answer.
# """

# # ✅ FIX: Include {agent_scratchpad} in the prompt
# prompt = ChatPromptTemplate.from_messages([
#     ("system", system_prompt),
#     ("user", "Question: {question}"),
#     ("assistant", "{agent_scratchpad}"),
# ])

# # Option A: chain for non-tool usage
# output_parser = StrOutputParser()
# base_chain = prompt | llm | output_parser

# # Option B: Agent with tools
# agent = create_openai_functions_agent(
#     llm=llm,
#     tools=tools,
#     prompt=prompt
# )

# agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# if input_text:
#     try:
#         # ✅ Pass "question" not "input"
#         response = agent_executor.invoke({"question": input_text})
#         st.write(response["output"])
#     except Exception as e:
#         st.error(f"Error while processing: {e}")
# from langchain_openai import ChatOpenAI
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import StrOutputParser

# from langchain.agents import AgentExecutor, create_openai_functions_agent

# from langchain_community.tools.yahoo_finance_news import YahooFinanceNewsTool
# from langchain_community.utilities.alpha_vantage import AlphaVantageAPIWrapper
# from langchain_community.agent_toolkits.polygon.toolkit import PolygonToolkit
# from langchain_community.utilities.polygon import PolygonAPIWrapper
# from langchain_community.agent_toolkits.financial_datasets.toolkit import FinancialDatasetsToolkit
# from langchain_community.utilities.financial_datasets import FinancialDatasetsAPIWrapper

# import os
# from dotenv import load_dotenv
# import streamlit as st

# # 🔹 Load keys
# load_dotenv()
# os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
# os.environ["ALPHAVANTAGE_API_KEY"] = os.getenv("ALPHAVANTAGE_API_KEY")
# #os.environ["POLYGON_API_KEY"] = os.getenv("POLYGON_API_KEY")
# os.environ["FINANCIAL_DATASETS_API_KEY"] = os.getenv("FINANCIAL_DATASETS_API_KEY")

# # 🔹 Streamlit UI
# st.title("📈 Finance Assistant with Buy/Sell Recommendation")
# input_text = st.text_input("Ask me about stocks, finance, or general queries:")

# # 🔹 LLM Setup
# llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5)

# # 🔹 Tools
# yahoo_news_tool = YahooFinanceNewsTool()
# alpha_vantage = AlphaVantageAPIWrapper()

# #polygon_api = PolygonAPIWrapper(polygon_api_key=os.environ["POLYGON_API_KEY"])
# #polygon_toolkit = PolygonToolkit.from_polygon_api_wrapper(polygon_api)

# fd_wrapper = FinancialDatasetsAPIWrapper(
#     financial_datasets_api_key=os.environ["FINANCIAL_DATASETS_API_KEY"]
# )
# fd_toolkit = FinancialDatasetsToolkit(api_wrapper=fd_wrapper)

# tools = [
#     yahoo_news_tool,
#     #*polygon_toolkit.get_tools(),
#     *fd_toolkit.get_tools(),
#     # You can later wrap AlphaVantage outputs as custom tool
# ]

# # 🔹 System Prompt (Extended with Buy/Sell logic)
# system_prompt = """
# You are a financial assistant with access to live stock data, news, and financial datasets.
# When a user asks about a company/stock:
# - Retrieve and analyze recent market data & news sentiment.
# - Provide a BUY, SELL, or HOLD recommendation.
# - Explain your reasoning clearly in qualitative terms (e.g., "Positive earnings + bullish news = Buy").
# - Be cautious: If data is uncertain, recommend HOLD.

# For general questions (not finance), just answer normally.
# """

# prompt = ChatPromptTemplate.from_messages([
#     ("system", system_prompt),
#     ("user", "Question: {question}"),
#     ("assistant", "{agent_scratchpad}"),
# ])

# # 🔹 Agent
# agent = create_openai_functions_agent(
#     llm=llm,
#     tools=tools,
#     prompt=prompt
# )

# agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# # 🔹 Run
# if input_text:
#     try:
#         response = agent_executor.invoke({"question": input_text})

#         st.subheader("🔎 Assistant’s Answer")
#         st.write(response["output"])

#     except Exception as e:
#         st.error(f"Error while processing: {e}")

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langchain.agents import AgentExecutor, create_openai_functions_agent

from langchain_community.tools.yahoo_finance_news import YahooFinanceNewsTool
from langchain_community.utilities.alpha_vantage import AlphaVantageAPIWrapper
from langchain_community.agent_toolkits.polygon.toolkit import PolygonToolkit
from langchain_community.utilities.polygon import PolygonAPIWrapper
from langchain_community.agent_toolkits.financial_datasets.toolkit import FinancialDatasetsToolkit
from langchain_community.utilities.financial_datasets import FinancialDatasetsAPIWrapper

import os
from dotenv import load_dotenv
import streamlit as st

# 🔹 Load API keys
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
os.environ["ALPHAVANTAGE_API_KEY"] = os.getenv("ALPHAVANTAGE_API_KEY")
#os.environ["POLYGON_API_KEY"] = os.getenv("POLYGON_API_KEY")
os.environ["FINANCIAL_DATASETS_API_KEY"] = os.getenv("FINANCIAL_DATASETS_API_KEY")

# 🔹 Streamlit UI
st.set_page_config(page_title="Finance Assistant", page_icon="📈", layout="wide")
st.title("📊 AI-Powered Finance Assistant with Buy/Sell Recommendation")

# ✅ Custom CSS
st.markdown("""
    <style>
    .rec-box {
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        margin-top: 20px;
        box-shadow: 0 6px 15px rgba(0,0,0,0.3);
        animation: fadeIn 1.2s ease-in-out;
    }
    .buy {
        background: linear-gradient(135deg, #28a745, #5cd65c);
        color: white;
    }
    .sell {
        background: linear-gradient(135deg, #dc3545, #ff6b6b);
        color: white;
    }
    .hold {
        background: linear-gradient(135deg, #ffc107, #ffd966);
        color: black;
    }
    @keyframes fadeIn {
        from {opacity: 0; transform: translateY(10px);}
        to {opacity: 1; transform: translateY(0);}
    }
    </style>
""", unsafe_allow_html=True)

# 🔹 User Input
input_text = st.text_input("💬 Ask about stocks, finance, or general queries:")

# 🔹 LLM Setup
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5)

# 🔹 Tools
yahoo_news_tool = YahooFinanceNewsTool()
alpha_vantage = AlphaVantageAPIWrapper()

#polygon_api = PolygonAPIWrapper(polygon_api_key=os.environ["POLYGON_API_KEY"])
#polygon_toolkit = PolygonToolkit.from_polygon_api_wrapper(polygon_api)

fd_wrapper = FinancialDatasetsAPIWrapper(
    financial_datasets_api_key=os.environ["FINANCIAL_DATASETS_API_KEY"]
)
fd_toolkit = FinancialDatasetsToolkit(api_wrapper=fd_wrapper)

tools = [
    yahoo_news_tool,
   # *polygon_toolkit.get_tools(),
    *fd_toolkit.get_tools(),
]

# 🔹 Prompt
system_prompt = """
You are a financial assistant with access to stock data, news, and financial datasets.
When a user asks about a company/stock:
- Retrieve and analyze recent market data & sentiment.
- Provide a BUY, SELL, or HOLD recommendation.
- Explain your reasoning clearly in qualitative terms.
- If data is uncertain, recommend HOLD.

For general questions, just answer normally.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("user", "Question: {question}"),
    ("assistant", "{agent_scratchpad}"),
])

# 🔹 Agent
agent = create_openai_functions_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 🔹 Run
if input_text:
    try:
        response = agent_executor.invoke({"question": input_text})
        answer = response["output"]

        st.subheader("🔎 Assistant’s Analysis")
        st.write(answer)

        # ✅ Highlight recommendation
        if "BUY" in answer.upper():
            st.markdown('<div class="rec-box buy">✅ Recommendation: BUY</div>', unsafe_allow_html=True)
        elif "SELL" in answer.upper():
            st.markdown('<div class="rec-box sell">🚨 Recommendation: SELL</div>', unsafe_allow_html=True)
        elif "HOLD" in answer.upper():
            st.markdown('<div class="rec-box hold">🤔 Recommendation: HOLD</div>', unsafe_allow_html=True)

    except Exception as e:
        st.error(f"⚠️ Error while processing: {e}")
