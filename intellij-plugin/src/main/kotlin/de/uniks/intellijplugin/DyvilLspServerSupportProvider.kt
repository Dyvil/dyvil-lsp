@file:Suppress("UnstableApiUsage")

package de.uniks.intellijplugin

import com.intellij.execution.ExecutionException
import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.javascript.nodejs.interpreter.NodeCommandLineConfigurator
import com.intellij.javascript.nodejs.interpreter.NodeJsInterpreterManager
import com.intellij.javascript.nodejs.interpreter.local.NodeJsLocalInterpreter
import com.intellij.javascript.nodejs.interpreter.wsl.WslNodeInterpreter
import com.intellij.lang.javascript.service.JSLanguageServiceUtil
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.platform.lsp.api.LspServerSupportProvider
import com.intellij.platform.lsp.api.ProjectWideLspServerDescriptor

class DyvilLspServerSupportProvider : LspServerSupportProvider {
  override fun fileOpened(project: Project, file: VirtualFile, serverStarter: LspServerSupportProvider.LspServerStarter) {
    if (file.extension != "dyv") return

    val node = NodeJsInterpreterManager.getInstance(project).interpreter
    if (node !is NodeJsLocalInterpreter && node !is WslNodeInterpreter) return

    serverStarter.ensureServerStarted(DyvilLspServerDescriptor(project))
  }
}

private class DyvilLspServerDescriptor(project: Project) : ProjectWideLspServerDescriptor(project, "Dyvil") {
  override fun isSupportedFile(file: VirtualFile) = file.extension == "dyv"

  override fun createCommandLine(): GeneralCommandLine {
    val interpreter = NodeJsInterpreterManager.getInstance(project).interpreter
    if (interpreter !is NodeJsLocalInterpreter && interpreter !is WslNodeInterpreter) {
      // shouldn't happen, checked in LspServerSupportProvider
      throw ExecutionException("Node interpreter not configured")
    }

    val lsp = JSLanguageServiceUtil.getPluginDirectory(javaClass, "language-server/main.js")
    if (lsp == null || !lsp.exists()) {
      // broken plugin installation?
      throw ExecutionException("Language Server not found")
    }

    return GeneralCommandLine().apply {
      withParentEnvironmentType(GeneralCommandLine.ParentEnvironmentType.CONSOLE)
      withCharset(Charsets.UTF_8)
      addParameter(lsp.path)
      addParameter("--stdio")

      NodeCommandLineConfigurator.find(interpreter)
        .configure(this, NodeCommandLineConfigurator.defaultOptions(project))
    }
  }
}
