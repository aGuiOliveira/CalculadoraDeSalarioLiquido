function formataInputsReal(valor) {
  /* Formatando valores dos inputs */
  function limpandoString(string) {
    return string.replace(/[\D]+/g, "");
  }

  function formatandoReal(valor) {
    const lastTwoDigits = valor.slice(-2);
    const rest = valor.slice(0, -2);
    return rest.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + lastTwoDigits;
  }

  let novoValor = limpandoString(valor);

  //Remover 0 da frente do numero
  while (novoValor[0] === "0") {
    novoValor = novoValor.replace(/(^[0])/g, "");
  }

  //Não deixa chegar a R$ 1M
  if (novoValor.length > 8) {
    for (let i = novoValor.length; i > 8; i--) {
      novoValor = novoValor.split("");
      novoValor = novoValor.toString();
      novoValor = novoValor.replace(/,/g, "");
    }
  } else if (novoValor.length < 3) {
    //Adiciona o 0 caso a string seja menor que 3 caracteres
    for (let i = novoValor.length; i < 3; i++) {
      novoValor = novoValor.split("");
      novoValor.unshift("0");
      novoValor = novoValor.toString();
    }
  }

  //Definindo o valor no Input
  return "R$ " + formatandoReal(limpandoString(novoValor));
}

const salarioLiquidoForm = document.querySelector("#salario-liquido-form");
if (salarioLiquidoForm) {
  const inputSalarioBruto = document.querySelector("#salario-bruto");
  const inputNumeroDependentes = document.querySelector("#numero-dependentes");
  const inputOutrosDescontos = document.querySelector("#outros-descontos");
  const calcularSalarioBtn = document.querySelector("#salario-calcular-btn");
  const respostasCalculoSalario = document.querySelector(
    ".respostas-calculo-salario"
  );

  //Informações necessárias
  let salarioBruto = 0;
  let outrosDescontos = 0;
  let valorInss = 0;
  let nDependentes = 0;

  // Formatando valores dos inputs
  function mudouValorInput(event) {
    event.target.value = formataInputsReal(event.target.value);
  }

  function limparString(string) {
    return string.replace(/[\D]+/g, "");
  }

  function calculaValores(event) {
    event.preventDefault();

    salarioBruto = +limparString(inputSalarioBruto.value).replace(
      /([0-9]{2})$/g,
      ".$1"
    );
    outrosDescontos = +limparString(inputOutrosDescontos.value).replace(
      /([0-9]{2})$/g,
      ".$1"
    );

    nDependentes = +inputNumeroDependentes.value;
    if (nDependentes < 0) {
      nDependentes = 0;
    }
    inputNumeroDependentes.value = nDependentes;

    //Calculando INSS
    if (salarioBruto <= 1212) {
      valorInss = salarioBruto * 0.075; // 75%
    } else if (salarioBruto > 1212 && salarioBruto <= 2427.35) {
      valorInss = (salarioBruto - 1212) * 0.09 + 90.9;
    } else if (salarioBruto > 2427.35 && salarioBruto <= 3641.03) {
      valorInss = (salarioBruto - 2427.35) * 0.12 + 200.28;
    } else if (salarioBruto > 3641.03 && salarioBruto <= 7087.22) {
      valorInss = (salarioBruto - 3641.03) * 0.14 + 345.92;
    } else if (salarioBruto > 7087.22) {
      valorInss = 828.39;
    }

    //Calculando o IRRF
    let calculoIrrf = salarioBruto - valorInss - nDependentes * 189.59;
    let valorIrrf = 0;

    if (calculoIrrf <= 1903.98) {
      valorIrrf = 0;
    } else if (calculoIrrf > 1903.98 && calculoIrrf <= 2826.65) {
      valorIrrf = calculoIrrf * 0.075 - 142.8;
    } else if (calculoIrrf > 2826.65 && calculoIrrf <= 3751.05) {
      valorIrrf = calculoIrrf * 0.15 - 354.8;
    } else if (calculoIrrf > 3751.05 && calculoIrrf <= 4664.68) {
      valorIrrf = calculoIrrf * 0.225 - 636.13;
    } else if (calculoIrrf > 4664.68) {
      valorIrrf = calculoIrrf * 0.275 - 869.36;
    }

    //Adicionando classe ativo no elemento que deve aparecer
    respostasCalculoSalario.classList.add("ativo");

    //Excluindo os elementos anteriores
    const elementosAntigos = document.querySelectorAll(
      ".respostas-calculo-salario div"
    );
    elementosAntigos.forEach((elemento) => {
      elemento.remove();
    });

    //Criando elementos que irão aparecer
    respostasCalculoSalario.appendChild(
      elementoSalario("Salário Bruto", true, salarioBruto.toFixed(2))
    );
    respostasCalculoSalario.appendChild(
      elementoSalario("INSS", false, valorInss.toFixed(2))
    );
    respostasCalculoSalario.appendChild(
      elementoSalario("IRRF", false, valorIrrf.toFixed(2))
    );
    respostasCalculoSalario.appendChild(
      elementoSalario("Outros descontos", false, outrosDescontos.toFixed(2))
    );

    //Criando o ultimo elemento com valor a receber
    let totalLiquido = (
      salarioBruto -
      valorInss -
      valorIrrf -
      outrosDescontos
    ).toFixed(2);

    totalLiquido = formatandoReal(limparString(totalLiquido));
    const elemento = document.createElement("div");
    elemento.innerHTML = `<p>Valor a receber</p><span>R$ ${totalLiquido}</span>`;
    elemento.classList.add("resultado-linha");
    respostasCalculoSalario.appendChild(elemento);
  }

  inputSalarioBruto.addEventListener("keyup", mudouValorInput);
  inputOutrosDescontos.addEventListener("keyup", mudouValorInput);
  calcularSalarioBtn.addEventListener("click", calculaValores);

  //Criando elemento e formatando textos
  function elementoSalario(texto, positivo, valor) {
    valor = `R$ ${formatandoReal(limparString(valor))}`;
    const infoElement = document.createElement("div");
    infoElement.classList.add("resultado-linha");
    let sinal = "+";

    if (!positivo) {
      infoElement.classList.add("negativo");
      sinal = "-";
    }
    infoElement.innerHTML = `<p>${texto}</p><span>${valor} ${sinal}</span>`;

    return infoElement;
  }

  //Formata a string para retornar o numero com virgula e ponto
  function formatandoReal(valor) {
    const lastTwoDigits = valor.slice(-2);
    const rest = valor.slice(0, -2);
    return rest.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + lastTwoDigits;
  }
}
