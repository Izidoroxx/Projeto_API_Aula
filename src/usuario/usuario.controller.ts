//classe controller do módulo de usuário
//Classe controller é responsável por receber as requisições de fora da API, ele adminstra as requisições recebendo e respondendo elas.

import { Body, Controller, Get, Param, Post, Put,Delete } from "@nestjs/common";
import { criaUsuarioDTO } from "./dto/usuario.dto";
import { UsuarioEntity } from "./usuario.entity";
import {v4  as uuid} from 'uuid'
import { UsuariosArmazenados } from "./usuario.dm";
import { RetornoUsuarioDTO } from "./dto/retornoUsuario.dto";
import { ListaUsuarioDTO } from "./dto/listaUsuario.dto";
import { loginUsuarioDTO } from "./dto/loginUsuario.dto";
import { alteraUsuarioDTO } from "./dto/alteraUsuario.dto";

//decorator responsável por definir que essa classe é um controller, dentro do parenteses é necessário informar o URL desse controller
@Controller('/usuarios')
export class UsuarioController{
    //controller com injeção de dependencia da classe de usuários armazenados
    constructor(private Usuarios : UsuariosArmazenados){

    }

    //POST - Recebe dados, pode ou não retornar informações, mas em geral recebe dados e retorna uma resposta
    //GET - Recebe apenas parametros, mas retorna dados variados, normalmente utilizado para consulta de dados
    //PUT - recebe dados, utilizado para fazer alterações de registros
    //DELETE - recebe dados, utilizado para remover registros


    @Post()//essa linha, seria um decorator para definir que a função é um metodo POST
    //Para receber dados do body da requisição, deve utilizar o decorator de "Body", especificando depois a variavel
    async criaUsuario(@Body() dadosUsuario: criaUsuarioDTO){       
        //criação do objeto de usuário, aqui é criado um objeto específico desse usuário 
        var novoUsuario = new UsuarioEntity(uuid(), dadosUsuario.nome, dadosUsuario.idade, 
                                            dadosUsuario.cidade, dadosUsuario.email,
                                            dadosUsuario.telefone, dadosUsuario.senha
        )
        //gravação do usuário, aqui é inserido no DM o usuário criado anteriormente
        this.Usuarios.AdicionarUsuario(novoUsuario);

        //criação do padrão de retorno, para depois ser retornado como resposta do método, também é retornado os dados do usuário logado
        var retorno = new RetornoUsuarioDTO('Usuario criado',novoUsuario);        
        return retorno        
    }

    @Post('/login')//linha que define o método post para login, nesse caso é idenficado o URL
    async fazerLogin(@Body() dadosLogin: loginUsuarioDTO){
        //chamada da função de login
        var retornoLogin = this.Usuarios.Login(dadosLogin.email,dadosLogin.senha)
        //criação de retorno, onde caso a resposta seja true é retornado login efetuado, caso seja false, retorna email ou senha invalidos, também é retornado o usuário logado
        var retorno = new RetornoUsuarioDTO(retornoLogin.status?'Login efetuado':'Email ou senha invalidos',retornoLogin.usuario);        
        return retorno;       
        
    }

    @Put('/:id')//linha que define o método vai ser de alteração (put), nesse caso também é especificado um parametro na URL, por onde vai chegar o id do usuário
    async alteraUsuario(@Body() dadosNovos: alteraUsuarioDTO,@Param('id') id: string){//aqui é definido que vai receber dados tanto do body quanto da URL(param)
        //aqui é chamada a função de alteração de usuário, onde ja é feita toda a modificação do usuário
        var retornoAlteracao = this.Usuarios.alteraUsuario(id,dadosNovos)
        //criação do padrão de retorno
        var retorno = new RetornoUsuarioDTO('Alteração Efetuada',retornoAlteracao);        
        return retorno;       
        
    }

    @Get('/:ID')//criação de método GET, para retornar usuários filtrados pelo ID, onde é necessário passar o ID do usuário pelo url 
    async retornaUsuarioId(@Param('ID') ID:string){
        //aqui é feita a pesquisa do usuário, depois é criado mapeado os dados desse usuário para um retorno padrão (lista usuario DTO)
        var usuariosListados = this.Usuarios.pesquisaId(ID);
        const ListaRetorno = new ListaUsuarioDTO(usuariosListados.id,
                                                usuariosListados.nome,
                                                usuariosListados.email)

        return {
                Usuario: ListaRetorno
            };
    }

    @Get()//aqui é criado um método GET sem nenhum tipo de recepção de dados, onde é retornada uma lista de uusários
    async retornaUsuario(){
        //Aqui são pesquisados os usuários a serem listados, depois é feito um mapeamento de dados para retornar as informações no padrão de resposta esperado (listaUsuarioDTO)
        var usuariosListados = this.Usuarios.Usuarios;
        const ListaRetorno = usuariosListados.map(
            usuario => new ListaUsuarioDTO(
                usuario.id,
                usuario.nome,
                usuario.email
            )
        );
        
       
        return {
                Usuarios: ListaRetorno
            };
    }

    @Delete('/:id')
    async removeUsuario(@Param('id') id: string){
        const usuarioRemovido = await this.Usuarios.removeUsuario(id);
        var retorno = new RetornoUsuarioDTO('Exclusão Efetuada', usuarioRemovido);
        return retorno;
        }


}